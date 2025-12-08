"use client"

import Link from 'next/link';
import { Button } from '@/components/shadcn-ui/button';
import { cn } from '@/lib/utils/cn';
import { formatNumber } from '@/lib/utils/format-number';
import { GithubIcon } from '@/components/icon/github-icon';
import { useGitHubRepo } from '@/lib/api';

type GitHubStarProps = {
  owner: string;
  repo: string;
  className?: string;
}

export function GitHubStar({ owner, repo, className }: GitHubStarProps) {
  const { data, isLoading } = useGitHubRepo(owner, repo);

  if (isLoading) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(className)}
      asChild
    >
      <Link
        href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubIcon />
        {formatNumber(data?.stargazers_count ?? 0)}
      </Link>
    </Button>
  );
}
