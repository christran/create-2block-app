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

export interface ResetPasswordTemplateProps {
  fullname: string;
  url: string;
}

const APP_TITLE = "✌️BLOCK"
const fullname = "Chris Tran"
const url = "#"

export default function ResetPasswordTemplate() {
  return (
  <Html>
    <Head />
    <Preview>
      Reset your password
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* <Img
          src={`${baseUrl}/static/github.png`}
          width="32"
          height="32"
          alt="Github"
        /> */}

        <Text style={title}>
          <strong>{APP_TITLE}</strong>
        </Text>

        <Section style={section}>
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
        {/* <Text style={links}>
          <Link style={link}>Your security audit log</Link> ・{" "}
          <Link style={link}>Contact support</Link>
        </Text> */}

        <Text style={footer}>
          2BLOCK Co. ・1337 Legit Sreet ・Los Angeles, CA 90015
        </Text>
      </Container>
    </Body>
  </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
};

const subTitle = {
  fontSize: "18px",
  lineHeight: 1.25,
  margin: "0 0 18px 0",
  textAlign: "left" as const,
};

const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 12px 0",
  textAlign: "left" as const,
};

const button = {
  fontSize: "14px",
  fontWeight: "600",
  backgroundColor: "#09090b",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "12px 24px",
  margin: "6px 0 18px 0",
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