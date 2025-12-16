import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/avatar/upload
 * Upload a new avatar image for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = session.user;

    // Check if BLOB token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        { success: false, message: "Storage not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "La taille du fichier ne doit pas dépasser 5 Mo" },
        { status: 400 }
      );
    }

    console.log("Uploading avatar for user:", user.id);

    // Delete old avatar if exists
    if (user.image && user.image.includes("vercel-storage.com")) {
      try {
        console.log("Deleting old avatar:", user.image);
        await del(user.image);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continue even if deletion fails
      }
    }

    // Upload new avatar
    console.log("Uploading file to blob storage...");
    const blob = await put(`avatars/${user.id}-${Date.now()}.${file.type.split("/")[1]}`, file, {
      access: "public",
    });

    console.log("Avatar uploaded successfully:", blob.url);

    // Update user image in database
    await prisma.user.update({
      where: { id: user.id },
      data: { image: blob.url },
    });

    console.log("Database updated successfully");

    return NextResponse.json({
      success: true,
      data: { url: blob.url },
      message: "Avatar téléchargé avec succès",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    const errorMessage = error instanceof Error ? error.message : "Échec de l'upload de l'avatar";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/avatar/upload
 * Delete the current user's avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = session.user;

    if (!user.image) {
      return NextResponse.json(
        { success: false, message: "Aucun avatar à supprimer" },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob if it's stored there
    if (user.image.includes("vercel-storage.com")) {
      try {
        await del(user.image);
      } catch (error) {
        console.error("Error deleting avatar from blob:", error);
      }
    }

    // Update user to remove image
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    const errorMessage = error instanceof Error ? error.message : "Échec de la suppression de l'avatar";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
