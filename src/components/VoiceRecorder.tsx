import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface VoiceRecorderProps {
  onTranscriptionComplete: (statement: string) => void;
}

export const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    try {
      const fileName = `${crypto.randomUUID()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio_recordings")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("audio_recordings")
        .getPublicUrl(fileName);

      // Call the transcribe function
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audioUrl: publicUrl.publicUrl },
      });

      if (error) throw error;

      onTranscriptionComplete(data.text);
      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: "Failed to process audio recording.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-4 my-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
};