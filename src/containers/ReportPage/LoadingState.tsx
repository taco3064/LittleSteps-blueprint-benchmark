export default function LoadingState() {
  return (
    <div className="screen">
      <div className="screen-body-wide flex justify-center py-16">
        <div
          className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
          role="status"
        >
          <div
            className={
              'h-full w-1/3 rounded-full bg-primary-dark '
              + 'animate-[loading_1.2s_ease-in-out_infinite]'
            }
          />
          <span className="sr-only">載入中</span>
        </div>
      </div>
    </div>
  );
}
