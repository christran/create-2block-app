import React from "react";
import { Body, Container, Head, Html, Preview, Section, Text, Link } from "@react-email/components";
import { APP_TITLE, EMAIL_FOOTER, Paths } from "@2block/shared/shared-constants";
import { absoluteUrl } from "@2block/shared/utils";;

export default function AccountDeletedTemplate(props: { fullname: string, url: string, unsubscribe: string }) {
  const { fullname, url, unsubscribe } = props;

  return (
    <Html>
      <Head />
      <Head />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
      <Preview>
        Your account has been deleted {absoluteUrl(Paths.Home)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>
              {APP_TITLE}
            </Text>
            <Text style={heading}>
              Noooooo {fullname}!
            </Text>
            <Text style={text}>
              Hi <strong>{fullname}</strong>
            </Text>
            <Text style={text}>
              Your account has been successfully deleted. If you change your mind you can always sign up again <Link href={absoluteUrl(Paths.Home)}>here</Link>
            </Text>
          </Section>
        </Container>
        {/* <Text style={footer}>
          You received this email because you agreed to receive emails from 2BLOCK. 
          If you no longer wish to receive emails like this,
          <Link href={unsubscribe}> please update your preferences.</Link>
        </Text> */}
        <Text style={footer}>
          {EMAIL_FOOTER}
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
  // color: "#1a202c",
  color: "#00000",
  fontSize: "24px",
  fontWeight: "800",
  lineHeight: 1.25,
  textAlign: "left" as const,
};

const heading = {
  // color: "#1a202c",
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
  color: "#0366d6",
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