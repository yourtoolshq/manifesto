import type { APIRoute } from "astro";
import process from "node:process";

import { createServerEnv } from "../../env";

export const prerender = false;

const RESEND_CONTACTS_URL = "https://api.resend.com/contacts";
const DEVELOPER_UPDATES_TOPIC_ID = "1b824626-ea09-4d6d-9ac4-250265c0329e";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ResendErrorResponse = {
  message?: string;
  name?: string;
};

type WaitlistRequest = {
  email?: unknown;
  updates?: unknown;
};

type ResendTopicSubscription = {
  id: string;
  subscription: "opt_in" | "opt_out";
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

const getEnv = () =>
  createServerEnv({
    RESEND_API_KEY:
      import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY,
  });

const readResendError = async (response: Response) => {
  try {
    const body = (await response.json()) as ResendErrorResponse;
    return body.message ?? body.name ?? "Resend request failed.";
  } catch {
    return "Resend request failed.";
  }
};

const buildTopicSubscriptions = (
  updates: boolean,
): ResendTopicSubscription[] =>
  updates
    ? [
        {
          id: DEVELOPER_UPDATES_TOPIC_ID,
          subscription: "opt_in",
        },
      ]
    : [];

const updateExistingContact = async (email: string, apiKey: string) =>
  fetch(`${RESEND_CONTACTS_URL}/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      unsubscribed: false,
    }),
  });

const updateContactTopics = async (
  email: string,
  apiKey: string,
  topics: ResendTopicSubscription[],
) =>
  fetch(`${RESEND_CONTACTS_URL}/${encodeURIComponent(email)}/topics`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      topics,
    }),
  });

export const POST: APIRoute = async ({ request }) => {
  let body: WaitlistRequest;
  let env: ReturnType<typeof createServerEnv>;

  try {
    env = getEnv();
  } catch {
    return json({ message: "Waitlist service is not configured." }, 500);
  }

  try {
    body = (await request.json()) as WaitlistRequest;
  } catch {
    return json({ message: "Invalid request body." }, 400);
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const updates = body.updates === true;

  if (!emailPattern.test(email)) {
    return json({ message: "Enter a valid email address." }, 400);
  }

  const topics = buildTopicSubscriptions(updates);

  const createResponse = await fetch(RESEND_CONTACTS_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      ...(topics.length > 0 ? { topics } : {}),
    }),
  });

  if (createResponse.ok) {
    return json({ message: "You are on the waitlist." });
  }

  if (createResponse.status === 409) {
    const updateResponse = await updateExistingContact(
      email,
      env.RESEND_API_KEY,
    );

    if (!updateResponse.ok) {
      return json({ message: await readResendError(updateResponse) }, 502);
    }

    if (topics.length === 0) {
      return json({ message: "You are on the waitlist." });
    }

    const topicsResponse = await updateContactTopics(
      email,
      env.RESEND_API_KEY,
      topics,
    );

    if (topicsResponse.ok) {
      return json({ message: "You are on the waitlist." });
    }

    return json({ message: await readResendError(topicsResponse) }, 502);
  }

  return json({ message: await readResendError(createResponse) }, 502);
};
