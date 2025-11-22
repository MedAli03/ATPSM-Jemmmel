import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchSchoolYears } from "../../../api/annees";
import { listEnfants } from "../../../api/enfants";
import { getPeiHistory, listPeis } from "../../../api/peis";
import { useToast } from "../../../components/common/ToastProvider";

const TYPE_META = {
  OBSERVATION: { label: "ملاحظة أولية", color: "info" },
  ACTIVITY: { label: "نشاط", color: "primary" },
  NOTE: { label: "ملاحظة يومية", color: "success" },
  EVALUATION: { label: "تقييم", color: "warning" },
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HistoryEntryDialog({ open, entry, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" dir="rtl">
      <DialogTitle className="font-semibold flex items-center gap-2">
        <Chip
          label={TYPE_META[entry?.type]?.label || entry?.type || "عنصر"}
          color={TYPE_META[entry?.type]?.color || "default"}
          size="small"
        />
        <span>تفاصيل العنصر</span>
      </DialogTitle>
      <DialogContent dividers className="space-y-3">
        <Typography variant="body2" color="text.secondary">
          التاريخ: {formatDate(entry?.date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          المُرسل / المُعد: {entry?.author?.prenom || ""} {entry?.author?.nom || "—"}
        </Typography>
        <Divider />
        <pre className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap leading-6">
{JSON.stringify(entry?.details || {}, null, 2)}
        </pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
}

function HistoryList({ entries, onSelect }) {
  if (!entries?.length) {
    return (
      <Box className="text-center py-10 text-sm text-gray-500" dir="rtl">
        لا توجد عناصر في هذا التاريخ بعد.
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: "60vh", overflowY: "auto" }} dir="rtl">
      {entries.map((entry) => (
        <ListItem
          key={`${entry.type}-${entry.id}`}
          alignItems="flex-start"
          className="hover:bg-slate-50 rounded-xl border border-slate-100 my-1"
          secondaryAction={
            <Button size="small" onClick={() => onSelect(entry)}>
              التفاصيل
            </Button>
          }
        >
          <ListItemText
            primary={
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={TYPE_META[entry.type]?.label || entry.type}
                  color={TYPE_META[entry.type]?.color || "default"}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(entry.date)}
                </Typography>
              </Stack>
            }
            secondary={
              <Box className="mt-1 space-y-1">
                <Typography variant="body2" className="font-semibold">
                  {entry.author
                    ? `${entry.author.prenom || ""} ${entry.author.nom || ""}`
                    : "—"}
                </Typography>
                <Typography variant="body2" className="text-gray-700 whitespace-pre-wrap">
                  {entry.summary || "—"}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default function PresidentPeiHistory() {
  const toast = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedPei, setSelectedPei] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [detailEntry, setDetailEntry] = useState(null);

  const yearsQuery = useQuery({
    queryKey: ["annees", "history"],
    queryFn: fetchSchoolYears,
  });

  useEffect(() => {
    const years = yearsQuery.data || [];
    if (!selectedYear && years.length) {
      const active = years.find((y) => y.est_active) || years[0];
      setSelectedYear(active?.id || "");
    }
  }, [yearsQuery.data, selectedYear]);

  const enfantsQuery = useQuery({
    queryKey: ["enfants", "history", childSearch],
    queryFn: () => listEnfants({ page: 1, pageSize: 50, q: childSearch }),
  });
  const enfantsOptions = enfantsQuery.data?.rows || [];

  const peisQuery = useQuery({
    queryKey: ["peis", "byChild", selectedChild, selectedYear],
    enabled: !!selectedChild,
    queryFn: () =>
      listPeis({
        enfant_id: selectedChild,
        ...(selectedYear ? { annee_id: selectedYear } : {}),
        page: 1,
        pageSize: 50,
      }),
  });
  const peiOptions = peisQuery.data?.rows || [];

  useEffect(() => {
    if (!selectedPei && peiOptions.length) {
      setSelectedPei(peiOptions[0].id);
    }
  }, [peiOptions, selectedPei]);

  const historyQuery = useQuery({
    queryKey: ["pei", selectedPei, "history"],
    enabled: !!selectedPei,
    queryFn: () => getPeiHistory(selectedPei),
    onError: (err) => {
      const message = err?.response?.data?.message || "تعذر تحميل تاريخ PEI";
      toast?.(message, "error");
    },
  });

  const filteredHistory = useMemo(() => {
    const items = historyQuery.data?.history || [];
    if (typeFilter === "ALL") return items;
    return items.filter((item) => item.type === typeFilter);
  }, [historyQuery.data, typeFilter]);

  return (
    <Box className="space-y-4" dir="rtl">
      <Box className="flex items-center justify-between">
        <div>
          <Typography variant="h5" className="font-semibold">
            سجل ملاحظات وأنشطة PEI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            عرض زمني للأنشطة، الملاحظات، التقييمات والملاحظة الأولية لكل مشروع.
          </Typography>
        </div>
        <Stack direction="row" spacing={1}>
          {Object.entries(TYPE_META).map(([key, meta]) => (
            <Chip
              key={key}
              label={meta.label}
              color={typeFilter === key ? meta.color : "default"}
              variant={typeFilter === key ? "filled" : "outlined"}
              onClick={() =>
                setTypeFilter((prev) => (prev === key ? "ALL" : key))
              }
            />
          ))}
          <Chip
            label="الكل"
            color={typeFilter === "ALL" ? "secondary" : "default"}
            variant={typeFilter === "ALL" ? "filled" : "outlined"}
            onClick={() => setTypeFilter("ALL")}
          />
        </Stack>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormControl fullWidth size="small">
          <InputLabel>السنة الدراسية</InputLabel>
          <Select
            value={selectedYear}
            label="السنة الدراسية"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {(yearsQuery.data || []).map((y) => (
              <MenuItem key={y.id} value={y.id}>
                {y.libelle || y.label || y.nom || y.id}
                {y.est_active ? " (نشطة)" : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="بحث عن طفل"
          value={childSearch}
          onChange={(e) => setChildSearch(e.target.value)}
          placeholder="ابحث بالاسم"
        />

        <FormControl fullWidth size="small">
          <InputLabel>اختر الطفل</InputLabel>
          <Select
            value={selectedChild}
            label="اختر الطفل"
            onChange={(e) => {
              setSelectedChild(e.target.value);
              setSelectedPei("");
            }}
          >
            {enfantsOptions.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.prenom || ""} {c.nom || ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormControl fullWidth size="small">
          <InputLabel>مشروع PEI</InputLabel>
          <Select
            value={selectedPei}
            label="مشروع PEI"
            onChange={(e) => setSelectedPei(e.target.value)}
            disabled={!peiOptions.length}
          >
            {peiOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.id} — {p.statut}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box className="flex items-center gap-2 text-sm text-gray-600">
          {peisQuery.isLoading && <CircularProgress size={20} />}
          {!peisQuery.isLoading && selectedPei && (
            <Typography>
              تاريخ الإنشاء: {formatDate(
                peiOptions.find((p) => Number(p.id) === Number(selectedPei))?.
                  date_creation
              )}
            </Typography>
          )}
        </Box>
      </Box>

      <Box className="bg-white rounded-2xl border shadow-sm p-4" dir="rtl">
        {historyQuery.isLoading ? (
          <Box className="flex items-center gap-2 text-gray-600">
            <CircularProgress size={20} />
            <span>جار تحميل التاريخ...</span>
          </Box>
        ) : historyQuery.isError ? (
          <Typography color="error" variant="body2">
            حدث خطأ أثناء تحميل التاريخ.
          </Typography>
        ) : (
          <HistoryList entries={filteredHistory} onSelect={setDetailEntry} />
        )}
      </Box>

      <HistoryEntryDialog
        open={!!detailEntry}
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
      />
    </Box>
  );
}
