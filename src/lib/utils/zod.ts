import { object, string } from 'zod';

export const signInSchema = object({
  email: string({ required_error: "L'adresse email est requise" })
    .min(1, "L'adresse email est requise")
    .email('Email invalide'),
  password: string({ required_error: 'Le mot de passe est requis' })
    .min(1, 'Le mot de passe est requis')
    // .min(8, 'Le mot de passe doit comporter plus de 8 caractères')
    .max(64, 'Le mot de passe ne doit pas dépasser 64 caractères'),
});
