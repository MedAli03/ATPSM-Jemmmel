import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Composer from "../Composer";

describe("Composer", () => {
  it("sends message on enter and preserves newline with shift+enter", async () => {
    const handleSend = vi.fn(() => Promise.resolve());
    render(<Composer onSend={handleSend} initialDraft="" />);

    const textarea = screen.getByPlaceholderText("اكتب رسالتك…");
    fireEvent.change(textarea, { target: { value: "مرحبا" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(handleSend).toHaveBeenCalledWith({ text: "مرحبا", attachments: [] });

    fireEvent.change(textarea, { target: { value: "مرحبا" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(handleSend).toHaveBeenCalledTimes(1);
  });
});
