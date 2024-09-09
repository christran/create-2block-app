import React from "react";
import { Body, Container, Head, Html, Preview, Section, Text, Button, Link, Font } from "@react-email/components";

export default function AccountDeletedTemplate(props: { fullname: string, url: string, unsubscribe: string }) {
  const { fullname, url, unsubscribe } = props;

  return (
    <Html>
      <Head />
      {/* Add Inter font import */}
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
      <Preview>
        Welcome to 2BLOCK!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>
              Noooooo {fullname}!
            </Text>
            <Text style={text}>
              Hey <strong>{fullname}</strong>
            </Text>
            <Text style={paragraph}>
              Why are you leaving us?!
            </Text>
          </Section>
        </Container>
        <Text style={footer}>
          You received this email because you agreed to receive emails from 2BLOCK. 
          If you no longer wish to receive emails like this,
          <Link href={unsubscribe}> please update your preferences.</Link>
        </Text>
        <Text style={footer}>
          2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015
        </Text>
      </Body>
    </Html>
  );
}

AccountDeletedTemplate.PreviewProps = {
  fullname: "Chris Tran",
  url: "#",
  unsubscribe: "#"
};

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
};

const container = {
  backgroundColor: "#ffffff",
  maxWidth: "640px",
  margin: "0 auto",
  padding: "20px 0px 18px",
  // marginTop: "32px",
  marginBottom: "4px",
};

const section = {
  padding: "0 32px",
};

const heading = {
  textAlign: "center" as const,
  fontSize: "32px",
  fontWeight: "900",
  padding: "10px 0 10px 0",
  margin: "20px 0",
};

const text = {
  fontSize: "14px",
  margin: "0 0 10px 0",
  textAlign: "left" as const,
};

const link = {
  fontSize: "14px",
  color: "#0366d6",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "left" as const,
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
  marginTop: "10px",
  maxWidth: "480px",
  margin: "0 auto",
};