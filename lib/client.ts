import Perplexity from "@perplexity-ai/perplexity_ai";

let clientInstance: Perplexity | null = null;

export function getClient(): Perplexity {
    if (!clientInstance) {
        // Uses PERPLEXITY_API_KEY environment variable automatically
        clientInstance = new Perplexity();
    }
    return clientInstance;
}
