// src/hooks/useChildMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEnfant,
  deleteEnfant,
  upsertFiche,
  upsertParentsFiche,
  linkParent,
  unlinkParent,
  createEnfantFlow,
} from "../api/enfants";

/**
 * Create full flow (POST enfant -> PUT fiche -> PUT parents_fiche)
 * With compensation DELETE on failure.
 *
 * mutate({ enfant, fiche, parentsFiche })
 * onSuccess: ({ id }) => { ... }
 */
export function useCreateEnfantFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfant, fiche, parentsFiche }) =>
      createEnfantFlow({ enfant, fiche, parentsFiche }),
    onSuccess: ({ id }) => {
      // refresh list + the new child caches
      qc.invalidateQueries({ queryKey: ["enfants"] });
      qc.invalidateQueries({ queryKey: ["enfant", id] });
      qc.invalidateQueries({ queryKey: ["fiche_enfant", id] });
      qc.invalidateQueries({ queryKey: ["parents_fiche", id] });
    },
  });
}

/**
 * Update enfant basic fields (if your backend supports PUT /enfants/:id)
 * mutate({ enfantId, payload })
 */
export function useUpdateEnfant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfantId, payload }) => updateEnfant(enfantId, payload),
    onSuccess: (_data, { enfantId }) => {
      qc.invalidateQueries({ queryKey: ["enfant", enfantId] });
      qc.invalidateQueries({ queryKey: ["enfants"] });
    },
  });
}

/**
 * Delete enfant
 * mutate(enfantId)
 */
export function useDeleteEnfant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enfantId) => deleteEnfant(enfantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enfants"] });
    },
  });
}

/**
 * Upsert fiche_enfant
 * mutate({ enfantId, payload })
 */
export function useUpdateFiche() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfantId, payload }) => upsertFiche(enfantId, payload),
    onSuccess: (_data, { enfantId }) => {
      qc.invalidateQueries({ queryKey: ["fiche_enfant", enfantId] });
      qc.invalidateQueries({ queryKey: ["enfant", enfantId] });
    },
  });
}

/**
 * Upsert parents_fiche
 * mutate({ enfantId, payload })
 */
export function useUpdateParentsFiche() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfantId, payload }) =>
      upsertParentsFiche(enfantId, payload),
    onSuccess: (_data, { enfantId }) => {
      qc.invalidateQueries({ queryKey: ["parents_fiche", enfantId] });
      qc.invalidateQueries({ queryKey: ["enfant", enfantId] });
    },
  });
}

/**
 * Link parent to enfant
 * mutate({ enfantId, parent_user_id })
 */
export function useLinkParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfantId, parent_user_id }) =>
      linkParent(enfantId, parent_user_id),
    onSuccess: (_data, { enfantId }) => {
      qc.invalidateQueries({ queryKey: ["enfant", enfantId] });
      qc.invalidateQueries({ queryKey: ["parents_fiche", enfantId] });
      qc.invalidateQueries({ queryKey: ["enfants"] });
    },
  });
}

/**
 * Unlink parent from enfant
 * mutate({ enfantId })
 */
export function useUnlinkParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enfantId }) => unlinkParent(enfantId),
    onSuccess: (_data, { enfantId }) => {
      qc.invalidateQueries({ queryKey: ["enfant", enfantId] });
      qc.invalidateQueries({ queryKey: ["parents_fiche", enfantId] });
      qc.invalidateQueries({ queryKey: ["enfants"] });
    },
  });
}

export default {
  useCreateEnfantFlow,
  useUpdateEnfant,
  useDeleteEnfant,
  useUpdateFiche,
  useUpdateParentsFiche,
  useLinkParent,
  useUnlinkParent,
};
