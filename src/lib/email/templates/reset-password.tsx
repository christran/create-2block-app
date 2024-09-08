import { render } from "@react-email/render";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link
} from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export interface ResetPasswordTemplateProps {
  fullname: string;
  url: string;
}

export default function ResetPasswordTemplate({ fullname, url }: ResetPasswordTemplateProps) {
  return (
    <Html>
    <Head />
    <Preview>
      Reset your password
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={section}>
          <Text style={title}>
              <strong>{APP_TITLE}</strong>
          </Text>
          <Text style={subTitle}>
            <strong>Password Reset</strong>
          </Text>
          <Text style={text}>
            Hello <strong>{fullname}</strong>
          </Text>
          <Text style={text}>
            Someone recently requested a password change for your account. If this was
            you, you can set a new password here:
          </Text>

          <Button style={button} href={url}>
              Reset password
          </Button>

        <Text style={text}>
            If you didn&apos;t request this, you may ignore this email.
        </Text>
        </Section>
      </Container>
      <Text style={footer}>
        2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015
      </Text>
    </Body>
  </Html>
  );
};

ResetPasswordTemplate.PreviewProps = {
  fullname: "Chris Tran",
  url: "#"
}

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
};

const container = {
  backgroundColor: "#ffffff",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "12px 0px 32px",
  // marginTop: "32px",
  marginBottom: "4px",
};

const section = {
  padding: "0px 32px",
  textAlign: "center" as const,
};

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
  textAlign: "left" as const,
};

const subTitle = {
  fontSize: "18px",
  lineHeight: 1.25,
  margin: "0 0 18px 0",
  textAlign: "left" as const,
};

const text = {
  textAlign: "left" as const,
};

const button = {
  fontSize: "14px",
  fontWeight: "600",
  backgroundColor: "#171717",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "10px 80px",
  margin: "10px 0 10px 0",
};

const links = {
  textAlign: "center" as const,
};

const link = {
  color: "#0366d6",
  fontSize: "12px",
};

const footer = {
  color: "#6a737d",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "10px",
};