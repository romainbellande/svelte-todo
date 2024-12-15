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

export async function sendActivationEmail({
	email,
	activationToken,
	firstname,
	lastname
}: SendActivationEmail) {
	const activationLink = `${PUBLIC_BASE_URL}/activate?token=${activationToken}`;
	const sendSmtpEmail = new SendSmtpEmail();

	sendSmtpEmail.templateId = 2;
	sendSmtpEmail.to = [{ email }];
	sendSmtpEmail.params = {
		user: {
			firstname,
			lastname
		},
		activationLink
	};

	try {
		await apiInstance.sendTransacEmail(sendSmtpEmail);
	} catch (error) {
		console.error('Error sending activation email:', error);
		throw error;
	}
}
