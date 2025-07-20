import { AZURE } from "../constants/config";

export const sendMessageToAzure = async (
  text: string,
  systemPrompt?: string
) => {
  const url = `${AZURE.ENDPOINT}/openai/deployments/${AZURE.DEPLOYMENT}/chat/completions?api-version=${AZURE.API_VERSION}`;

  const body: any = {
    messages: [],
    max_completion_tokens: 500,
  };

  if (systemPrompt) {
    body.messages.push({ role: "system", content: systemPrompt });
  }
  body.messages.push({ role: "user", content: text });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZURE.API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Azure error:", errorText);
    throw new Error("Failed to get response from Azure");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
