import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resolvePublicAssetUrl } from '../constants/filters';

export default function ScenicImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fallbackTitle = '图片加载失败',
  fallbackSubtitle = '请检查 data.json 中的 url 路径或图片文件是否存在。',
}) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolvePublicAssetUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={[
          'flex flex-col items-center justify-center gap-3 bg-white px-6 text-center',
          className,
        ].join(' ')}
      >
        <ImageOff className="h-9 w-9 text-zinc-500" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-zinc-900">{fallbackTitle}</div>
          <div className="text-xs leading-5 text-zinc-600">{fallbackSubtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
