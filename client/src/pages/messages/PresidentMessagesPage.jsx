import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "../../services/messagingApi";
import NewThreadModal from "../../components/messages/NewThreadModal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/ToastProvider";
import { formatRelativeTime } from "../../utils/relativeTime";

function getThreadTitle(thread, currentUserId) {
  if (!thread) return "محادثة";
  if (thread.title) return thread.title;
  const names = (thread.participants || [])
    .filter((p) => Number(p.id) !== Number(currentUserId))
    .map((p) => p.name)
    .filter(Boolean);
  return names.join("، ") || "محادثة";
}

function MessageBubble({ message, isMine }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: "80%",
          px: 2,
          py: 1.25,
          borderRadius: 3,
          bgcolor: isMine ? "primary.main" : "grey.100",
          color: isMine ? "primary.contrastText" : "text.primary",
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {message.text}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent={isMine ? "flex-end" : "flex-start"}
          sx={{ mt: 0.75 }}
        >
          <Typography variant="caption" color={isMine ? "primary.100" : "text.secondary"}>
            {message.sender?.name || "-"}
          </Typography>
          <Typography variant="caption" color={isMine ? "primary.100" : "text.secondary"}>
            {formatRelativeTime(message.createdAt)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default function PresidentMessagesPage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [composerText, setComposerText] = useState("");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const messageListRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const threadsQuery = useQuery({
    queryKey: ["threads", { q: debouncedSearch }],
    queryFn: () => messagingApi.listThreads({ q: debouncedSearch || undefined }),
    staleTime: 5000,
  });

  const threads = useMemo(() => threadsQuery.data?.data || [], [threadsQuery.data]);

  useEffect(() => {
    if (!threads.length) {
      setSelectedThreadId(null);
      return;
    }
    if (selectedThreadId && threads.some((t) => Number(t.id) === Number(selectedThreadId))) {
      return;
    }
    setSelectedThreadId(Number(threads[0].id));
  }, [threads, selectedThreadId]);

  const activeThread = useMemo(
    () => threads.find((thread) => Number(thread.id) === Number(selectedThreadId)),
    [threads, selectedThreadId]
  );

  const threadDetailsQuery = useQuery({
    queryKey: ["thread", selectedThreadId],
    queryFn: () => messagingApi.getThread(selectedThreadId),
    enabled: Boolean(selectedThreadId),
    staleTime: 5000,
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedThreadId],
    queryFn: () => messagingApi.listMessages(selectedThreadId),
    enabled: Boolean(selectedThreadId),
    refetchInterval: false,
  });

  const messages = useMemo(() => messagesQuery.data?.data || [], [messagesQuery.data]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last?.sender?.id === currentUser?.id) return;
    messagingApi.markRead(selectedThreadId, last.id).catch(() => {});
  }, [messages, selectedThreadId, currentUser]);

  const sendMutation = useMutation({
    mutationFn: () => messagingApi.sendMessage(selectedThreadId, { text: composerText.trim() }),
    onSuccess: (message) => {
      setComposerText("");
      queryClient.setQueryData(["messages", selectedThreadId], (old) => {
        if (!old) return { data: [message], nextCursor: null };
        return { ...old, data: [...(old.data || []), message] };
      });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: () => toast?.("تعذّر إرسال الرسالة", "error"),
  });

  const handleSend = (event) => {
    event.preventDefault();
    if (!selectedThreadId || !composerText.trim()) return;
    sendMutation.mutate();
  };

  const handleThreadCreated = (thread, message) => {
    setNewModalOpen(false);
    if (thread?.id) {
      setSelectedThreadId(Number(thread.id));
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.setQueryData(["messages", thread.id], { data: message ? [message] : [] });
    }
  };

  const loadingThreads = threadsQuery.isLoading;
  const loadingMessages = messagesQuery.isLoading;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: "100%", bgcolor: "#f8fafc" }} dir="rtl">
      <Paper sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 360 },
              borderRadius: 3,
              p: 2,
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <div>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  الرسائل
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  محادثاتك مع الفريق والأولياء
                </Typography>
              </div>
              <IconButton color="primary" onClick={() => setNewModalOpen(true)}>
                <AddCommentIcon />
              </IconButton>
            </Stack>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن محادثة"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {loadingThreads ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Paper key={idx} sx={{ height: 64, borderRadius: 2, bgcolor: "grey.100" }} />
                  ))}
                </Stack>
              ) : threads.length ? (
                <List disablePadding>
                  {threads.map((thread) => {
                    const isActive = Number(thread.id) === Number(selectedThreadId);
                    const title = getThreadTitle(thread, currentUser?.id);
                    const preview = thread.lastMessage?.text || "لا توجد رسائل";
                    const updatedLabel = thread.updatedAt ? formatRelativeTime(thread.updatedAt) : "";
                    return (
                      <ListItem key={thread.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          selected={isActive}
                          onClick={() => setSelectedThreadId(Number(thread.id))}
                          sx={{
                            borderRadius: 2,
                            alignItems: "flex-start",
                            bgcolor: isActive ? "primary.light" : "common.white",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>{thread.isGroup ? "👥" : "💬"}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight={700} noWrap>
                                  {title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {updatedLabel}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                              >
                                {preview}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                  لا توجد محادثات بعد. ابدأ رسالة جديدة.
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddCommentIcon />}
              sx={{ mt: 2, borderRadius: 2 }}
              onClick={() => setNewModalOpen(true)}
              fullWidth
            >
              محادثة جديدة
            </Button>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 2,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {activeThread ? (
              <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <div>
                    <Typography variant="h6" fontWeight={700}>
                      {getThreadTitle(threadDetailsQuery.data || activeThread, currentUser?.id)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(threadDetailsQuery.data?.participants || activeThread.participants || [])
                        .map((p) => p.name)
                        .join("، ")}
                    </Typography>
                  </div>
                </Stack>
                <Divider />
                <Box
                  ref={messageListRef}
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    py: 2,
                    px: { xs: 1, md: 2 },
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    mt: 1,
                  }}
                >
                  {loadingMessages ? (
                    <Stack spacing={1.5}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Paper key={idx} sx={{ height: 60, borderRadius: 2, bgcolor: "grey.100" }} />
                      ))}
                    </Stack>
                  ) : messages.length ? (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMine={Number(message.sender?.id) === Number(currentUser?.id)}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      لا توجد رسائل بعد في هذه المحادثة.
                    </Typography>
                  )}
                </Box>
                <Box component="form" onSubmit={handleSend} sx={{ mt: 2 }}>
                  <TextField
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    disabled={sendMutation.isPending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            color="primary"
                            type="submit"
                            disabled={sendMutation.isPending || !composerText.trim()}
                          >
                            {sendMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }} spacing={2}>
                <Typography variant="h6" color="text.secondary">
                  لا توجد محادثة محددة
                </Typography>
                <Button variant="contained" startIcon={<AddCommentIcon />} onClick={() => setNewModalOpen(true)}>
                  ابدأ رسالة جديدة
                </Button>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Paper>

      <NewThreadModal open={newModalOpen} onClose={() => setNewModalOpen(false)} onCreated={handleThreadCreated} />
    </Box>
  );
}
