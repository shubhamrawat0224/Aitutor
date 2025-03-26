// "use client";

// import { useChat } from "ai";
// import { useState, useEffect } from "react";
// import { Send, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Card } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   type AssistanceMode,
//   AssistanceModeSelector,
// } from "@/components/assistance-mode-selector";
// import { FileUpload } from "@/components/file-upload";
// import { VideoRecommendations } from "@/components/video-recommendations";
// import { toast } from "@/components/ui/use-toast";

// export function Chat() {
//   // Always declare all hooks at the top level
//   const [mode, setMode] = useState<AssistanceMode>("hint");
//   const [documentContent, setDocumentContent] = useState<string | null>(null);
//   const [documentName, setDocumentName] = useState<string | null>(null);
//   const [topics, setTopics] = useState<string[]>([]);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   // Initialize useChat hook unconditionally
//   const {
//     messages,
//     input,
//     handleInputChange,
//     handleSubmit,
//     isLoading,
//     setMessages,
//   } = useChat({
//     api: "/api/chat",
//     body: {
//       mode,
//       documentContent,
//     },
//     initialMessages: [
//       {
//         id: "welcome",
//         role: "assistant",
//         content:
//           "Hi there! I'm your homework helper. I won't give you direct answers, but I can help you understand concepts, provide hints, or suggest resources. You can also upload a document for me to analyze.",
//       },
//     ],
//   });

//   // Use useEffect to update the body when mode or documentContent changes
//   useEffect(() => {
//     // This effect doesn't need to do anything, it's just to ensure
//     // we're following the rules of hooks by having all hooks at the top level
//   }, [mode, documentContent]);

//   const handleFileProcessed = async (content: string, fileName: string) => {
//     // Set state first
//     setDocumentContent(content);
//     setDocumentName(fileName);
//     setIsAnalyzing(true);

//     // Add a message to indicate we're processing the document
//     const processingMessageId = Date.now().toString();
//     setMessages([
//       ...messages,
//       {
//         id: processingMessageId,
//         role: "assistant",
//         content: `I'm analyzing your document "${fileName}". This may take a moment...`,
//       },
//     ]);

//     // Analyze the document to extract topics
//     try {
//       const response = await fetch("/api/analyze-topics", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ content }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to analyze document: ${response.status}`);
//       }

//       const data = await response.json();

//       // Update topics state
//       setTopics(data.topics || []);

//       // Create a new messages array with the updated message
//       const updatedMessages = messages.map((msg) =>
//         msg.id === processingMessageId
//           ? {
//               id: processingMessageId,
//               role: "assistant",
//               content: `I've analyzed your document "${fileName}". I can help you with questions about ${data.topics.join(
//                 ", "
//               )}. What would you like to know?`,
//             }
//           : msg
//       );

//       // Add the new message if the processing message wasn't found
//       if (!updatedMessages.some((msg) => msg.id === processingMessageId)) {
//         updatedMessages.push({
//           id: processingMessageId,
//           role: "assistant",
//           content: `I've analyzed your document "${fileName}". I can help you with questions about ${data.topics.join(
//             ", "
//           )}. What would you like to know?`,
//         });
//       }

//       // Update messages state
//       setMessages(updatedMessages);
//     } catch (error) {
//       console.error("Error analyzing document:", error);

//       // Show error toast
//       toast({
//         title: "Document Analysis Issue",
//         description: "I'll still try to help you with your document.",
//         variant: "destructive",
//       });

//       // Update the message to indicate we had an issue but will still help
//       const updatedMessages = messages.map((msg) =>
//         msg.id === processingMessageId
//           ? {
//               id: processingMessageId,
//               role: "assistant",
//               content: `I've received your document "${fileName}". What would you like to know about it?`,
//             }
//           : msg
//       );

//       // Add the new message if the processing message wasn't found
//       if (!updatedMessages.some((msg) => msg.id === processingMessageId)) {
//         updatedMessages.push({
//           id: processingMessageId,
//           role: "assistant",
//           content: `I've received your document "${fileName}". What would you like to know about it?`,
//         });
//       }

//       // Update messages state
//       setMessages(updatedMessages);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <Tabs defaultValue="chat">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="chat">Chat</TabsTrigger>
//           <TabsTrigger value="upload">Upload Document</TabsTrigger>
//         </TabsList>

//         <TabsContent value="chat" className="space-y-4">
//           <AssistanceModeSelector value={mode} onChange={setMode} />

//           {documentName && (
//             <div className="flex items-center p-2 bg-muted rounded-md text-sm">
//               <FileText className="h-4 w-4 mr-2 text-primary" />
//               <span>
//                 Working with: <strong>{documentName}</strong>
//                 {isAnalyzing && (
//                   <span className="ml-2 text-muted-foreground">
//                     (Analyzing...)
//                   </span>
//                 )}
//               </span>
//             </div>
//           )}

//           <Card className="p-4 h-[400px] overflow-y-auto flex flex-col">
//             <div className="flex-1 space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${
//                     message.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`rounded-lg px-4 py-2 max-w-[80%] ${
//                       message.role === "user"
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted"
//                     }`}
//                   >
//                     {message.content}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>

//           <form onSubmit={handleSubmit} className="flex space-x-2">
//             <Textarea
//               value={input}
//               onChange={handleInputChange}
//               placeholder="Ask about your homework..."
//               className="flex-1 min-h-[80px]"
//             />
//             <Button
//               type="submit"
//               size="icon"
//               disabled={isLoading || !input.trim() || isAnalyzing}
//             >
//               <Send className="h-4 w-4" />
//               <span className="sr-only">Send</span>
//             </Button>
//           </form>

//           {topics.length > 0 && <VideoRecommendations topics={topics} />}
//         </TabsContent>

//         <TabsContent value="upload">
//           <FileUpload onFileProcessed={handleFileProcessed} />

//           <div className="mt-4 p-4 bg-muted rounded-md">
//             <h3 className="text-sm font-medium mb-2">Supported File Types:</h3>
//             <ul className="text-sm space-y-1 text-muted-foreground">
//               <li>• PDF Documents (.pdf)</li>
//               <li>• Word Documents (.doc, .docx)</li>
//               <li>• Text Files (.txt)</li>
//             </ul>
//             <p className="text-xs text-muted-foreground mt-2">
//               Your document will be analyzed to provide relevant assistance, but
//               we won't store it permanently.
//             </p>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type AssistanceMode,
  AssistanceModeSelector,
} from "@/components/assistance-mode-selector";
import { FileUpload } from "@/components/file-upload";
import { VideoRecommendations } from "@/components/video-recommendations";
import { toast } from "@/components/ui/use-toast";

export function Chat() {
  const [mode, setMode] = useState<AssistanceMode>("hint");
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm your homework helper. I won't give you direct answers, but I can help you understand concepts, provide hints, or suggest resources. You can also upload a document for me to analyze.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileProcessed = async (content: string, fileName: string) => {
    setDocumentContent(content);
    setDocumentName(fileName);
    setIsAnalyzing(true);

    const processingMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: processingMessageId,
        role: "assistant",
        content: `Analyzing document '${fileName}'...`,
      },
    ]);

    try {
      const response = await fetch("/api/analyze-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok)
        throw new Error(`Failed to analyze document: ${response.status}`);

      const data = await response.json();
      setTopics(data.topics || []);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === processingMessageId
            ? {
                ...msg,
                content: `Document '${fileName}' analyzed. Topics: ${data.topics.join(
                  ", "
                )}.`,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Document Analysis Issue",
        description: "I'll still try to help you.",
        variant: "destructive",
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === processingMessageId
            ? { ...msg, content: `Received '${fileName}'. How can I help?` }
            : msg
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return; // Prevent sending empty messages

    // Create a new array including the user's message
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: trimmedInput },
    ];

    // Update state to reflect the new user message
    setMessages(newMessages);
    setInput(""); // Clear input field after submission

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mode, documentContent }),
      });

      const responseText = await response.text(); // Read response as text
      // console.log("response text", responseText);
      let data;

      try {
        data = JSON.parse(responseText);
        let datas = JSON.stringify(data);
        // console.log("type od variable", typeof datas);
      } catch {
        //data = { error: responseText }; // Handle non-JSON response
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Add assistant's response to messages
      setMessages([
        ...newMessages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: responseText || "No response received.",
        },
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages([
        ...newMessages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Oops! Something went wrong. Try again later.",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Tabs defaultValue="chat">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="space-y-4">
          <AssistanceModeSelector value={mode} onChange={setMode} />
          {documentName && (
            <div className="flex items-center p-2 bg-muted rounded-md text-sm">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              <span>
                Working with: <strong>{documentName}</strong>
                {isAnalyzing && (
                  <span className="ml-2 text-muted-foreground">
                    {" "}
                    (Analyzing...)
                  </span>
                )}
              </span>
            </div>
          )}
          <Card className="p-4 h-[400px] overflow-y-auto flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </Card>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your homework..."
              className="flex-1 min-h-[80px]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || isAnalyzing}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          {topics.length > 0 && <VideoRecommendations topics={topics} />}
        </TabsContent>
        <TabsContent value="upload">
          <FileUpload onFileProcessed={handleFileProcessed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
