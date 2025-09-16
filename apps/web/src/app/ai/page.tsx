"use client";

import { useState } from "react";
import { askAI } from "@/lib/api";

export default function AIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    const res = await askAI(question);
    setAnswer(res.answer);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Query</h1>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleAsk}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Ask
      </button>

      {answer && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
