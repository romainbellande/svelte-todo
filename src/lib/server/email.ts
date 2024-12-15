import { env } from '$env/dynamic/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import {
	TransactionalEmailsApi,
	SendSmtpEmail,
	TransactionalEmailsApiApiKeys
} from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
type SendActivationEmail = {
	email: string;
	activationToken: string;
	firstname: string;
	lastname: string;
};

export async function sendInvitationEmail({
	email,
	activationToken,
	firstname,
	lastname
}: SendActivationEmail) {
	const activationLink = `${PUBLIC_BASE_URL}/activate?token=${activationToken}`;
	const sendSmtpEmail: SendSmtpEmail = {
		templateId: 2,
		to: [{ email }],
		params: {
			user: {
				firstname,
				lastname
			},
			activationLink
		}
	};

	try {
		await apiInstance.sendTransacEmail(sendSmtpEmail);
	} catch (error) {
		console.error('Error sending activation email:', error);
		throw error;
	}
}

export async function sendResetPasswordEmail(email: string, token: string) {
	const resetLink = `${env.PUBLIC_BASE_URL}/reset-password/${token}`;

	const sendSmtpEmail: SendSmtpEmail = {
		templateId: 3,
		to: [{ email }],
		params: {
			resetLink
		}
	};

	try {
		await apiInstance.sendTransacEmail(sendSmtpEmail);
	} catch (error) {
		console.error('Error sending reset password email:', error);
		throw error;
	}
}
