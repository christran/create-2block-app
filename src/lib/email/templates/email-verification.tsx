import { Body, Container, Head, Html, Preview, Section, Text, Button, Link } from "@react-email/components";
import { APP_TITLE, Paths } from "@/lib/constants";
import { env } from "@/env";

export interface EmailVerificationTemplateProps {
  fullname: string;
  code: string;
}

export const EmailVerificationTemplate = ({ fullname, code }: EmailVerificationTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Please verify your email address
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
              <strong>Verify your email address</strong>
            </Text>
            <Text style={text}>
              Hey <strong>{fullname}</strong>!
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
          <Text style={links}>
            <Link style={link}>Your security audit log</Link> ・{" "}
            <Link style={link}>Contact support</Link>
          </Text>

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
  margin: "0 0 10px 0",
  textAlign: "left" as const,
};


const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
};

const codeBox = {
  background: "rgb(245, 244, 245)",
  borderRadius: "4px",
  marginBottom: "30px",
  padding: "40px 10px",
};

const confirmationCodeText = {
  fontSize: "30px",
  textAlign: "center" as const,
  verticalAlign: "middle",
};

const button = {
  fontSize: "14px",
  backgroundColor: "#09090b",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "12px 24px",
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
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "60px",
};