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
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Submit MCP Server</CardTitle>
        <CardDescription>
          Please enter the GitHub repository address to import MCP Server
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="github-url"
              >
                GitHub Repository Address
              </label>
              <Input
                id="github-url"
                placeholder="For example: https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
