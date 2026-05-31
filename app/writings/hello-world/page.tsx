import { redirect } from 'next/navigation';

export default function HelloWorldRedirect() {
  redirect('/documents?doc=hello-world');
}
