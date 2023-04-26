import { Redirect } from "wouter";

interface PageParams {
  readonly project: string;
}

export default function ({ params }: { params: PageParams }) {
  return <Redirect to={`/${params.project}/en/`} />;
}
