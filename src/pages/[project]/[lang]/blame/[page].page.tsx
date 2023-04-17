interface PageParams {
  readonly project: string;
  readonly lang: string;
  readonly page: string;
}

export default function BlamePage({ params }: { params: PageParams }) {}
