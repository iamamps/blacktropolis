"use client";

import { HBCUS, isKnownHbcu } from "@/lib/hbcus";

interface SchoolFieldsProps {
  school: string;
  chapter: string;
  isHbcu: boolean;
  onChange: (patch: { school?: string; chapter?: string; isHbcu?: boolean }) => void;
  inputClass: string;
}

export function SchoolFields({ school, chapter, isHbcu, onChange, inputClass }: SchoolFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input
            list="hbcu-list"
            placeholder="School / campus (optional)"
            value={school}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ school: v, ...(isKnownHbcu(v) ? { isHbcu: true } : {}) });
            }}
            className={inputClass}
          />
          <datalist id="hbcu-list">
            {HBCUS.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
        </div>
        <input
          placeholder="Chapter (optional, e.g. Alpha Chapter)"
          value={chapter}
          onChange={(e) => onChange({ chapter: e.target.value })}
          className={inputClass}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={isHbcu}
          onChange={(e) => onChange({ isHbcu: e.target.checked })}
          className="h-4 w-4 accent-[#f2c14e]"
        />
        This is an HBCU event
      </label>
    </div>
  );
}
