import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

const ComplainForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ name, email, subject, message });
  };

  return (
    <div className="max-w-lg p-4 mx-auto my-10 border rounded-lg shadow-lg bg-card">
      <h1 className="mb-4 text-2xl font-bold">Complain Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/60">
            Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/60">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/60">
            Subject
          </label>
          <Input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/60">
            Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full mt-1"
            rows={4}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default ComplainForm;
