import React from "react";
import { Body, Container, Head, Html, Preview, Section, Text, Button, Link, Font } from "@react-email/components";
import { APP_TITLE, Paths } from "@/lib/constants";
import { env } from "@/env";

export interface EmailVerificationTemplateProps {
  fullname: string;
  code: string;
}

export default function EmailVerificationTemplate({fullname, code}: EmailVerificationTemplateProps) {
  return (
    <Html>
      <Head />
        {/* Add Inter font import */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
      <Preview>
        Please verify your email address
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>
              <strong>{APP_TITLE}</strong>
            </Text>
            <Text style={subTitle}>
              <strong>Verify your email address</strong>
            </Text>
            <Text style={text}>
              Hey <strong>{fullname}</strong>
            </Text>
            <Text style={text}>
              Thank you for registering for an account with us. To complete your
              registration, please verify your your account by using the following code:
            </Text>

            <Section style={codeBox}>
              <Text style={confirmationCodeText}>{code}</Text>
            </Section>

            <Button style={button} href={env.NEXT_PUBLIC_APP_URL + Paths.VerifyEmail}>
              Verify Email
            </Button>
          </Section>
        </Container>
        <Text style={footer}>
            2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015
        </Text>
      </Body>
    </Html>
  );
};

EmailVerificationTemplate.PreviewProps = {
  fullname: "Chris Tran",
  code: "12345"
};

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

const codeBox = {
  background: "#f5f5f5",
  maxWidth: "240px",
  borderRadius: "4px",
  marginBottom: "30px",
  padding: "5px 5px",
};

const confirmationCodeText = {
  fontSize: "26px",
  fontWeight: "600",
  textAlign: "center" as const,
  verticalAlign: "middle",
};

const button = {
  fontSize: "14px",
  fontWeight: "600",
  backgroundColor: "#171717",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "10px 80px",
  margin: "0 0 8px 0",
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