"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Github } from "lucide-react";

export default function SubmitForm() {
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!githubUrl) {
      toast({
        title: "请输入GitHub仓库地址",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5190";

      const response = await fetch(`${baseUrl}/mcpcard/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "omit",
        body: JSON.stringify({ github: githubUrl }),
      });

      const data = await response.json();

      if (response.status === 201) {
        toast({
          title: "Successfully submitted",
          description: `Successfully imported ${data.name || "MCP Server"}`,
        });

        setGithubUrl("");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Submit failed");
      }

      toast({
        title: "Submit successfully",
        description: `Successfully imported ${data.name || "MCP Server"}`,
      });

      setGithubUrl("");
    } catch (error) {
      toast({
        title: "Submit failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="container mx-auto py-12 px-4 relative z-1">
        <Card className="max-w-lg mx-auto bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

          <CardHeader>
            <CardTitle className="text-3xl font-bold font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
              Submit MCP Server
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Please enter the GitHub repository address to import MCP Server
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                    htmlFor="github-url"
                  >
                    GitHub Repository Address
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="github-url"
                      placeholder="For example: https://github.com/username/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-cyan-500 dark:focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 h-12"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
