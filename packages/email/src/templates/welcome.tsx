import React from "react";
import { Body, Container, Head, Html, Preview, Section, Text, Button, Link, Font } from "@react-email/components";
import { APP_TITLE, EMAIL_FOOTER, EMAIL_UNSUBSCRIBE, Paths } from "@2block/shared/shared-constants";

export default function WelcomeTemplate(props: { name: string, url: string, unsubscribe: string }) {
  const { name, url, unsubscribe } = props;

  return (
    <Html>
      <Head />
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
      <Preview>
        Welcome to 2BLOCK!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>
              {APP_TITLE}
            </Text>
            <Text style={heading}>
              Welcome to ✌️BLOCK!
            </Text>
            <Text style={text}>
              Hey <strong>{name}</strong>
            </Text>
            <Text style={text}>
              You're a few seconds away from greatness. You're now ready to
              to start using our app!
              {" "}
              <Link style={link} href={url}>Click here to get started</Link>
            </Text>
          </Section>
        </Container>
        <Text style={footer}>
          {EMAIL_UNSUBSCRIBE}
          <Link href={unsubscribe}> please update your preferences.</Link>
        </Text>
        <Text style={footer}>
          {EMAIL_FOOTER}
        </Text>
      </Body>
    </Html>
  );
}

WelcomeTemplate.PreviewProps = {
  name: "Chris Tran",
  url: "#",
  unsubscribe: Paths.Unsubscribe
};

const main = {
  // letterSpacing: ".005rem",
  backgroundColor: "#f5f5f5",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
};

const container = {
  // color: "#4a5568",
  backgroundColor: "#ffffff",
  maxWidth: "640px",
  margin: "0 auto",
  padding: "20px 0px 24px",
  // marginTop: "32px",
  marginBottom: "4px",
};

const section = {
  padding: "0 32px",
};

const title = {
  color: "#00000",
  fontSize: "24px",
  fontWeight: "800",
  lineHeight: 1.25,
  textAlign: "left" as const,
};

const heading = {
  color: "#00000",
  textAlign: "center" as const,
  fontSize: "32px",
  fontWeight: "900",
  padding: "10px 0 10px 0",
  margin: "20px 0",
};

const text = {
  fontSize: "14px",
  margin: "10px 0 10px 0",
  textAlign: "left" as const,
};

const link = {
  margin: "10px 0 10px 0",
  color: "#0366d6",
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

const unsubscribe = {
  color: "#6a737d",
  fontSize: "9px",
  maxWidth: "480px",
  margin: "0 auto",
  textAlign: "center" as const,
  marginTop: "10px",
}

const footer = {
  color: "#6a737d",
  fontSize: "11px",
  textAlign: "center" as const,
  marginTop: "5px",
  maxWidth: "480px",
  margin: "0 auto",
};