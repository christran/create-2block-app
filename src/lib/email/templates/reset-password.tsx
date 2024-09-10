import React from "react";
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
import { APP_TITLE, EMAIL_FOOTER } from "@/lib/constants";

export interface ResetPasswordTemplateProps {
  fullname: string;
  url: string;
}

export default function ResetPasswordTemplate({ fullname, url }: ResetPasswordTemplateProps) {
  return (
    <Html>
    <Head />
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
    <Preview>
      Reset your password
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={section}>
          <Text style={title}>
            {APP_TITLE}
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
        {EMAIL_FOOTER}
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
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
};

const container = {
  // color: "#4a5568",
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
  color: "#00000",
  fontSize: "24px",
  fontWeight: "800",
  lineHeight: 1.25,
  textAlign: "left" as const,
};

const subTitle = {
  color: "#00000",
  fontSize: "18px",
  lineHeight: 1.25,
  margin: "0 0 18px 0",
  textAlign: "left" as const,
};

const text = {
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const button = {
  fontSize: "16px",
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