import { useState } from "react";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const show = (opts: ConfirmDialogOptions) => {
    setOptions(opts);
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
    setOptions(null);
  };

  const confirm = async () => {
    if (!options) return;
    setLoading(true);
    try {
      await options.onConfirm();
    } finally {
      setLoading(false);
      hide();
    }
  };

  return { visible, loading, options, show, hide, confirm };
}
