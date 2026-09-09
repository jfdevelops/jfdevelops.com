export function BrandLogo() {
  return (
    <span className='inline-flex items-center gap-2.5' role='img' aria-label='JF Develops'>
      <img
        src='/brand/icon-192.png'
        alt=''
        width={48}
        height={48}
        className='block h-12 w-12 rounded-xl'
      />
      <span aria-hidden='true' className='font-display text-[30px] font-bold tracking-tight text-(--sea-ink)'>Develops</span>
    </span>
  );
}
