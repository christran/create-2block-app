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

export interface MagicLinkTemplateProps {
  fullname: string;
  url: string;
}

export default function MagicLinkTemplate({ fullname, url }: MagicLinkTemplateProps) {
  return (
    <Html>
    <Head />
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
    <Preview>
      Use this magic link to login
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={section}>
          <Text style={title}>
            {APP_TITLE}
          </Text>
          <Text style={subTitle}>
            <strong>Login with this Magic Link</strong>
          </Text>
          <Text style={text}>
            Hello <strong>{fullname}</strong>
          </Text>
          <Text style={text}>
            Use the button or link below to login to your account
          </Text>

          <div style={buttonContainer}>
            <Button style={button} href={url}>
            🪄 Magic Link 🪄
            </Button><br/>

            <Link style={link} href={url}>or click here to login</Link>

            <Text style={expirationText}>
            This link will expire in 5 minutes
            </Text>
          </div>

        {/* <Text style={text}>
            If you didn't request this, you may ignore this email.
        </Text> */}
        </Section>
      </Container>
      <Text style={footer}>
        {EMAIL_FOOTER}
      </Text>
    </Body>
  </Html>
  );
};

MagicLinkTemplate.PreviewProps = {
  fullname: "Chris Tran",
  url: "#",
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
  padding: "12px 0px 24px",
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
  margin: "10px 0 10px 0",
  textAlign: "left" as const,
};

const buttonContainer = {
  
}

const button = {
  fontSize: "16px",
  fontWeight: "600",
  backgroundColor: "#171717",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "10px 62px",
  margin: "10px 0 10px 0",
};

const expirationText = {
  fontSize: "11px",
  lineHeight: "24px",
  margin: "0px 0 0px 0",
  textAlign: "center" as const,
}

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
  marginTop: "5px",
};