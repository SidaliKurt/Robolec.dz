const GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-pro",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-embedding-exp-03-07"
];

export class Gemini {
    constructor(apiKey, model = "gemini-2.5-flash") {
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        this.history = [];
    }

    // Add a new user message and send it to Gemini
    sendMessage(userMessage, callback, onerror) {
        this.history.push({
            role: "user",
            parts: [{ text: userMessage }]
        });

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.apiUrl);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    const modelReply = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

                    // Save model response to history
                    this.history.push({
                        role: "model",
                        parts: [{ text: modelReply }]
                    });

                    callback(modelReply);
                } else {
                    if(onerror) onerror(`Error ${xhr.status}: ${xhr.statusText}`, null);
                }
            }
        };

        const data = JSON.stringify({ contents: this.history });
        xhr.send(data);
    }

    // Optional: clear chat history
    resetConversation() {
        this.history = [];
    }
}
