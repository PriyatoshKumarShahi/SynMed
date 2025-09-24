import { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VoiceCommands() {
  const navigate = useNavigate();
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      toast.info("Voice recognition stopped");
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
      toast.info("Voice recognition started");
    }
  };

  useEffect(() => {
    if (!transcript) return;

    const command = transcript.toLowerCase();

    if (command.includes("dashboard")) {
      navigate("/dashboard");
      toast.success("Navigating to Dashboard");
      resetTranscript();
    } else if (command.includes("profile")) {
      navigate("/profile");
      toast.success("Opening Profile");
      resetTranscript();
    } else if (command.includes("history")) {
      navigate("/history");
      toast.success("Showing Medical History");
      resetTranscript();
    } else if (command.includes("logout")) {
      localStorage.removeItem("authToken");
      navigate("/signin");
      toast.info("Logged out via voice command");
      resetTranscript();
    } else if (command.includes("scroll")) {
      window.scrollBy({ top: 200, behavior: "smooth" });
      resetTranscript();
    } else if (command.includes("ai chatbot") || command.includes("chatbot")) {
      navigate("/ai-chatbot");
      toast.success("Opening AI Chatbot");
      resetTranscript();
    } else if (command.includes("upload prescription") || command.includes("prescription")) {
      window.dispatchEvent(new CustomEvent("voice-upload", { detail: "prescription" }));
      resetTranscript();
    } else if (command.includes("upload test result") || command.includes("test result")) {
      window.dispatchEvent(new CustomEvent("voice-upload", { detail: "test" }));
      resetTranscript();
    } else if (command.includes("back") || command.includes("previous page")) {
      navigate(-1);
      toast.info("Going back to previous page");
      resetTranscript();
    }
  }, [transcript, navigate, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support voice commands.</span>;
  }

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-gray-900 text-white rounded-xl shadow-lg">
      <button
        onClick={toggleListening}
        className="px-4 py-2 bg-blue-500 rounded-lg"
      >
        {isListening ? "🎤 Stop Listening" : "🎤 Start Voice"}
      </button>
    </div>
  );
}
