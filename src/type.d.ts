interface File {
  filename: string;
  raw_url: string;
  content: string;
}

interface Gist {
  id: string;
  description: string;
  files: { [key: string]: File };
}
