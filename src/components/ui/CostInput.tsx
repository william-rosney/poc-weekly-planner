"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Composant input numérique pour le coût par personne
 * Utilise type="number" avec validation et arrondi à 2 décimales
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

    // Marquer comme en édition
    if (!isEditing) {
      setIsEditing(true);
    }

    // Si complètement vide, mettre le field à undefined
    if (rawValue === "") {
      setEditValue("");
      onChange(undefined);
      return;
    }

    // Pour type="number", la valeur est déjà validée par le navigateur
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed)) {
      setEditValue(rawValue);
      onChange(parsed);
    } else {
      // Si la valeur n'est pas un nombre valide, ne rien faire
      setEditValue(rawValue);
    }
  };

  const handleBlur = () => {
    // Si on n'était pas en mode édition, ne rien faire (évite d'effacer la valeur)
    if (!isEditing) {
      onBlur();
      return;
    }

    // Au blur, valider et arrondir
    if (editValue === "") {
      onChange(undefined);
    } else {
      const parsed = parseFloat(editValue);
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
      type="number"
      step="0.01"
      min="0"
      placeholder="0.00"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      disabled={disabled}
    />
  );
}
