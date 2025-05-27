"use server";

import { auth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function register(params: RegisterParams) {
	const { uid, name, email } = params;

	try {
		const userRecord = await db.collection("users").doc(uid).get();

		if (userRecord.exists) {
			return {
				success: false,
				message: "User already exists. Please log in instead.",
			};
		}

		await db.collection("users").doc(uid).set({
			name,
			email,
		});

		return {
			success: true,
			message: "User registered successfully. Please log in.",
		};
	} catch (error: any) {
		console.log("Error creating user!", error);

		if (error.code === "auth/email-already-exists") {
			return {
				success: false,
				message: "Email already exists. Please use a different email.",
			};
		}

		return {
			success: false,
			message: "An error occurred while creating the user. Please try again later.",
		};
	}
}

export async function setSessionCookie(idToken: string) {
	const cookieStore = await cookies();

	const sessionCookie = await auth.createSessionCookie(idToken, {
		expiresIn: ONE_WEEK * 1000, // 7 days
	});

	cookieStore.set("session", sessionCookie, {
		maxAge: ONE_WEEK,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		path: "/",
		sameSite: "lax",
	});
}

export async function login(params: LoginParams) {
	const { email, idToken } = params;

	try {
		const userRecord = await auth.getUserByEmail(email);

		if (!userRecord) {
			return {
				success: false,
				message: "User not found. Please register first.",
			};
		}

		await setSessionCookie(idToken);
	} catch (error) {
		console.log(error);
		return {
			success: false,
			message: "An error occurred while logging in. Please try again later.",
		};
	}
}

export async function getCurrentUser(): Promise<User | null> {
	const cookieStore = await cookies();

	const sessionCookie = cookieStore.get("session")?.value;

	if (!sessionCookie) {
		return null;
	}

	try {
		const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

		const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

		if (!userRecord.exists) {
			return null;
		}

		return {
			...userRecord.data(),
			id: userRecord.id,
		} as User;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function isAuthenticated() {
	const user = await getCurrentUser();

	return !!user;
}
