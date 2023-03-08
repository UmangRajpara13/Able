import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "org-jxVuiRGU2tgS8c4FEzrXIPUq",
    apiKey: `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`,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();