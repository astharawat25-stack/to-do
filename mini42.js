
const API_KEY = "";

const API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const topicInput = document.getElementById("topic");
const generateBtn = document.getElementById("generateBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const status = document.getElementById("status");

const quizBox = document.getElementById("quizBox");
const questionElement = document.getElementById("question");
const answerElement = document.getElementById("answer");
const explanationElement = document.getElementById("explanation");
const answerBox = document.getElementById("answerBox");

let currentQuiz = null;

generateBtn.addEventListener("click", async () => {
    const topic = topicInput.value.trim();

    if (!topic) {
        status.textContent = "Please enter a topic first!";
        topicInput.focus();
        return;
    }

    if (API_KEY === "YOUR_GEMINI_API_KEY") {
        status.textContent = "Please add your Gemini API key in script.js.";
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating Quiz...";
    status.textContent = "Gemini is preparing your question...";

    quizBox.hidden = true;
    answerBox.hidden = true;
    currentQuiz = null;

    try {
        const prompt = `
Create one beginner-friendly educational quiz question about "${topic}".

Return only a valid JSON object with these three string properties:
{
  "question": "One clear question",
  "answer": "The correct answer",
  "explanation": "A simple explanation"
}

Make sure the answer is factually correct.
Do not include Markdown code fences.
`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Unable to generate quiz."
            );
        }

        const responseText =
            data.candidates?.[0]?.content?.parts
                ?.map(({ text }) => text || "")
                .join("")
                .trim();

        if (!responseText) {
            throw new Error("Gemini returned an empty response.");
        }

        // Convert the JSON text into a JavaScript object.
        currentQuiz = JSON.parse(responseText);

        if (
            !currentQuiz.question ||
            !currentQuiz.answer ||
            !currentQuiz.explanation
        ) {
            throw new Error("The quiz response is incomplete.");
        }

        questionElement.textContent = currentQuiz.question;
        answerElement.textContent = currentQuiz.answer;
        explanationElement.textContent = currentQuiz.explanation;

        quizBox.hidden = false;
        status.textContent = "Your quiz is ready! 🎉";

    } catch (error) {
        status.textContent = "Something went wrong.";
        questionElement.textContent = "";
        quizBox.hidden = true;
        currentQuiz = null;
        console.error(error);
        alert(error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Quiz ✨";
    }
});

showAnswerBtn.addEventListener("click", () => {
    if (!currentQuiz) return;

    answerBox.hidden = false;
    showAnswerBtn.textContent = "Answer Revealed ✓";
});
