import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThreadItem from "../ThreadItem";

const thread = {
  id: "thread-1",
  participantIds: ["u-parent", "u-educateur"],
  participants: [
    { id: "u-parent", name: "أميمة" },
    { id: "u-educateur", name: "سامي" },
  ],
  unreadCount: 3,
  preview: { text: "مرحبا", senderId: "u-parent", relativeTime: "منذ دقيقة" },
  updatedAt: new Date().toISOString(),
};

describe("ThreadItem", () => {
  it("shows unread badge and handles selection", () => {
    const onSelect = vi.fn();
    render(<ThreadItem thread={thread} onSelect={onSelect} index={0} total={1} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalled();
  });
});
