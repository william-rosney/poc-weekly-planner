"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Composant input pour le coût par personne
 * Gère un état local string pour permettre l'édition fluide
 */
interface CostInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  name: string;
  disabled?: boolean;
}

export function CostInput({
  value,
  onChange,
  onBlur,
  name,
  disabled,
}: CostInputProps) {
  // État pour savoir si l'utilisateur est en train d'éditer
  const [isEditing, setIsEditing] = useState(false);
  // État local pour la valeur string pendant l'édition
  const [editValue, setEditValue] = useState("");

  // Dériver la valeur affichée : si en édition, utiliser editValue, sinon utiliser value
  const displayValue = isEditing
    ? editValue
    : value !== undefined
      ? String(value)
      : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Marquer comme en édition et stocker la valeur
    if (!isEditing) {
      setIsEditing(true);
    }
    setEditValue(rawValue);

    // Si complètement vide, mettre le field à undefined
    if (rawValue === "") {
      onChange(undefined);
      return;
    }

    // Autoriser uniquement les chiffres, le point et la virgule
    const sanitized = rawValue.replace(",", ".");

    // Vérifier que c'est un format numérique valide (optionnel: max 2 décimales)
    if (!/^\d*\.?\d{0,2}$/.test(sanitized)) {
      return; // Ne pas mettre à jour le field pour les caractères invalides
    }

    // Si c'est juste un point, on attend la suite
    if (sanitized === ".") {
      return;
    }

    // Parser et stocker la valeur
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Si on n'était pas en mode édition, ne rien faire (évite d'effacer la valeur)
    if (!isEditing) {
      onBlur();
      return;
    }

    // Au blur, nettoyer et valider
    const trimmed = editValue.trim();

    // Si vide ou invalide, mettre à undefined
    if (trimmed === "" || trimmed === ".") {
      onChange(undefined);
    } else {
      const sanitized = trimmed.replace(",", ".");
      const parsed = parseFloat(sanitized);
      if (!isNaN(parsed)) {
        // Arrondir à 2 décimales pour les montants
        const rounded = Math.round(parsed * 100) / 100;
        onChange(rounded);
      } else {
        onChange(undefined);
      }
    }

    // Sortir du mode édition
    setIsEditing(false);
    setEditValue("");
    onBlur();
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder="0.00"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      disabled={disabled}
    />
  );
}
