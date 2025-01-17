'use client';

import type { FC, FormEvent, KeyboardEvent } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { DeviceContext } from '@/context/DeviceContext';
import { isDomChildren } from '@/utils/isDomChildren';

export const TextareaForm: FC = () => {
  const { isMobile } = useContext(DeviceContext)!;
  // const { isLogged } = useContext(LoginContext)!;
  const { sendMessage } = useContext(ChatContext)!;

  // 是否正在中文输入
  const [isComposing, setIsComposing] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // touchstart textarea 外部时，执行 blur
  useEffect(() => {
    document.addEventListener('touchstart', (e) => {
      const targetElement = e.target as HTMLElement;
      // 如果 textarea 当前不是 focus 状态，则跳过
      if (textareaRef.current !== document.activeElement) {
        return;
      }
      // 如果触碰的是 form 内，则跳过
      if (isDomChildren(formContainerRef.current, targetElement)) {
        return;
      }
      // 如果触碰的是 form 外，则 blur textarea
      textareaRef.current?.blur();
    });
  }, []);

  /**
   * 更新 submit 按钮的 disable 态
   */
  const updateSubmitDisabled = useCallback(() => {
    const value = textareaRef.current?.value?.trim();
    if (value) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, []);

  /**
   * 更新 textarea 的高度
   */
  const updateTextareaHeight = useCallback(() => {
    const textareaElement = textareaRef.current;
    if (!textareaElement) {
      return;
    }
    // https://stackoverflow.com/a/24676492/2777142
    textareaElement.style.height = '5px';
    // 260 是十行半的高度，8 + 24 * 10.5 = 260
    const newHeight = Math.min(textareaElement.scrollHeight, 260);
    textareaElement.style.height = `${newHeight}px`;
    if (placeholderRef.current) {
      placeholderRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  /**
   * 输入内容触发
   */
  const onChange = useCallback(() => {
    updateTextareaHeight();
    // 保持滚动到最底下，bug 太多，先关闭
    // scrollToBottom();
    updateSubmitDisabled();
  }, [updateTextareaHeight, updateSubmitDisabled]);
  /** 中文输入法控制 */
  const onCompositionStart = useCallback(() => setIsComposing(true), []);
  const onCompositionEnd = useCallback(() => {
    setIsComposing(false);
    // 由于 onChange 和 onCompositionEnd 的时序问题，这里也需要调用 updateSubmitDisabled
    updateSubmitDisabled();
  }, [updateSubmitDisabled]);

  /**
   * 提交表单处理
   */
  const formOnSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      const value = textareaRef.current?.value?.trim();
      if (!value) {
        return;
      }
      // 提交后清空内容
      if (textareaRef.current?.value) {
        textareaRef.current.value = '';
      }
      updateTextareaHeight();
      updateSubmitDisabled();
      await sendMessage(value);
    },
    [sendMessage, updateTextareaHeight, updateSubmitDisabled],
  );

  /**
   * 修改回车默认行为
   */
  const onKeyDone = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // 如果正在中文输入，则跳过 keyDone 事件
      if (isComposing) {
        return;
      }
      // [Ctrl/Cmd + Enter] 发送消息
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        formOnSubmit();
        return;
      }
      // PC 端，回车发送消息
      if (!isMobile && e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        formOnSubmit();
        return;
      }
    },
    [isMobile, isComposing, formOnSubmit],
  );

  return (
    <>
      <div className="pb-[env(safe-area-inset-bottom)] pt-5 md:pt-8">
        <div placeholder="" className="h-10 md:h-16" ref={placeholderRef} />
      </div>
      <div
        className={`w-inherit fixed z-10 bottom-0 px-3 pt-2.5 bg-gray-100 border-t-[0.5px] border-gray
                    pb-[calc(0.625rem+env(safe-area-inset-bottom))]
                    md:tall:bottom-24 md:px-[1.75rem] md:-mx-4 md:py-4
                    dark:bg-gray-900`}
        ref={formContainerRef}
        id="form-container"
      >
        <form className="flex space-x-3" onSubmit={formOnSubmit}>
          <textarea
            className={`flex-grow px-3 py-2 resize-none bg-chat-bubble placeholder:text-gray-400
                      disabled:bg-gray-200 disabled:cursor-not-allowed md:min-h-[4rem]
                      dark:bg-chat-bubble-dark dark:disabled:bg-gray-700 dark:placeholder:text-gray-500`}
            ref={textareaRef}
            // disabled={!isLogged}
            // placeholder={isLogged ? '' : isMobile ? '请点击右上角设置密钥' : '请点击左上角钥匙按钮设置密钥'}
            onChange={onChange}
            onKeyDown={onKeyDone}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            rows={1}
          />
          <div className="flex items-center">
            <input className="px-3 py-2 h-full max-h-16" type="submit" value="发送" />
          </div>
        </form>
      </div>
    </>
  );
};
