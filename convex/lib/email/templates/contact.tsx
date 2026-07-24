import {
  Body,
  Container,
  Divider,
  Footer,
  Head,
  Logo,
  Preview,
  Root,
  Text,
  Theme,
} from '../components';
import { createSubject } from '../utils/createSubject';
import { renderTemplate } from '../utils/renderTemplate';

export type ContactEmailProps = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

export const createContactSubject = createSubject({
  props: {
    projectType: '',
    name: '',
  },
  render: ({ projectType, name }) =>
    `[JF Develops - New ${projectType} Inquiry]: New project inquiry from ${name}`,
});
export const contactEmail = renderTemplate(ContactEmail);

function ContactEmail({
  name,
  email,
  projectType,
  message,
}: ContactEmailProps) {
  return (
    <Root lang='en'>
      <Head />
      <Preview>
        {createContactSubject({
          name,
          projectType,
        })}
      </Preview>
      <Theme>
        <Body>
          <Container>
            <Logo />
            <Text>
              <strong>Name:</strong> {name}
            </Text>
            <Text>
              <strong>Email:</strong> {email}
            </Text>
            <Text>
              <strong>Project type:</strong> {projectType}
            </Text>
            <Divider />
            <Text className='mb-2 font-semibold'>Message</Text>
            <Text className='whitespace-pre-wrap'>{message}</Text>
            <Divider />
            <Footer>Sent from the JF Develops contact form.</Footer>
          </Container>
        </Body>
      </Theme>
    </Root>
  );
}
