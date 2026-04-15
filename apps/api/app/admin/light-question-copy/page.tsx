'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

type CopyConfig = {
  miniprogram: {
    guidedCard: {
      label: string;
      collapsed: Record<'default' | 'guided' | 'direct', { title: string; description: string }>;
      steps: Record<'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done', { title: string; description: string }>;
      processChoices: Array<{ id: string; title: string; description: string }>;
      processStyleChoices: Array<{ id: string; title: string; description: string }>;
      continentChoices: Array<{ id: string; title: string; description: string }>;
      ui: Record<string, string>;
    };
    discoverEditorial: {
      templates: {
        default: { title: string; subtitle: string };
        processBase: { titleTemplate: string; subtitle: string };
        continent: { titleTemplate: string; subtitleTemplate: string };
        country: { titleTemplate: string; subtitle: string };
        variety: { titleTemplate: string; subtitle: string };
      };
      reasons: Record<string, string>;
    };
  };
  api: {
    editorialConfigs: Array<{
      id: string;
      match: { process?: string; continent?: string; country?: string };
      title: string;
      subtitle: string;
    }>;
    editorialReasons: Record<string, string>;
  };
};

type LoadState = 'idle' | 'loading' | 'saving';

const collapsedLabels: Record<'default' | 'guided' | 'direct', string> = {
  default: '默认入口',
  guided: '引导入口',
  direct: '直接入口',
};

const stepLabels: Record<'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done', string> = {
  process_base: '步骤 1 基础处理法',
  process_style: '步骤 2 处理风格',
  continent: '步骤 3 大洲',
  country: '步骤 4 国家',
  variety: '步骤 5 豆种',
  done: '完成态',
};

function cloneConfig(config: CopyConfig): CopyConfig {
  return JSON.parse(JSON.stringify(config)) as CopyConfig;
}

export default function LightQuestionCopyPage() {
  const [savePassword, setSavePassword] = useState('');
  const [draft, setDraft] = useState<CopyConfig | null>(null);
  const [status, setStatus] = useState<LoadState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void requestConfig();
  }, []);

  const requestConfig = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/admin/light-question-copy');
      const payload = (await response.json()) as { ok?: boolean; data?: CopyConfig; error?: { message?: string } };
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? '加载失败');
      }
      setDraft(payload.data);
      setMessage('已加载当前文案。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加载失败');
    } finally {
      setStatus('idle');
    }
  };

  const saveConfig = async () => {
    if (!draft) return;
    if (!savePassword.trim()) {
      setMessage('保存时需要输入密码。');
      return;
    }

    setStatus('saving');
    setMessage('');
    try {
      const response = await fetch('/api/admin/light-question-copy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-save-password': savePassword.trim(),
        },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: { message?: string } };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? '保存失败');
      }
      setMessage('已保存到小程序和 API 配置文件。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败');
    } finally {
      setStatus('idle');
    }
  };

  const updateCollapsed = (
    key: 'default' | 'guided' | 'direct',
    field: 'title' | 'description',
    value: string
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.miniprogram.guidedCard.collapsed[key][field] = value;
      return next;
    });
  };

  const updateStep = (
    key: 'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done',
    field: 'title' | 'description',
    value: string
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.miniprogram.guidedCard.steps[key][field] = value;
      return next;
    });
  };

  const updateChoice = (
    group: 'processChoices' | 'processStyleChoices' | 'continentChoices',
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.miniprogram.guidedCard[group][index][field] = value;
      return next;
    });
  };

  const updateUiText = (field: string, value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.miniprogram.guidedCard.ui[field] = value;
      return next;
    });
  };

  const updateEditorialTemplate = (
    group: 'default' | 'processBase' | 'continent' | 'country' | 'variety',
    field: string,
    value: string
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      (next.miniprogram.discoverEditorial.templates[group] as Record<string, string>)[field] = value;
      return next;
    });
  };

  const updateMiniprogramReason = (field: string, value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.miniprogram.discoverEditorial.reasons[field] = value;
      return next;
    });
  };

  const updateApiReason = (field: string, value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.api.editorialReasons[field] = value;
      return next;
    });
  };

  const updateApiConfig = (index: number, field: 'id' | 'title' | 'subtitle', value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      next.api.editorialConfigs[index][field] = value;
      return next;
    });
  };

  const updateApiMatch = (index: number, field: 'process' | 'continent' | 'country', value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneConfig(current);
      if (value.trim()) {
        next.api.editorialConfigs[index].match[field] = value;
      } else {
        delete next.api.editorialConfigs[index].match[field];
      }
      return next;
    });
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>CoffeeAtlas 文案台</p>
          <h1 style={styles.title}>轻问答文案编辑器</h1>
          <p style={styles.lead}>
            这个页面会同时改两份配置文件：`apps/miniprogram/src/pages/all-beans/light-question-copy.json`
            和 `apps/api/data/light-question-copy.json`。保存后，小程序重新构建即可生效。
          </p>
        </div>
        <div style={styles.toolbar}>
          <label style={styles.fieldLabel}>
            保存密码
            <input
              style={styles.input}
              type="password"
              value={savePassword}
              onChange={(event) => setSavePassword(event.target.value)}
              placeholder="保存时输入 291803"
            />
          </label>
          <div style={styles.toolbarButtons}>
            <button style={styles.secondaryButton} onClick={requestConfig} disabled={status !== 'idle'}>
              {status === 'loading' ? '加载中...' : '加载当前文案'}
            </button>
            <button style={styles.primaryButton} onClick={saveConfig} disabled={!draft || status !== 'idle'}>
              {status === 'saving' ? '保存中...' : '保存'}
            </button>
          </div>
          {message ? <p style={styles.message}>{message}</p> : null}
        </div>
      </section>

      {!draft ? (
        <section style={styles.emptyCard}>
          <p style={styles.emptyText}>先输入 Token，再点“加载当前文案”。</p>
        </section>
      ) : (
        <>
          <section style={styles.grid}>
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>入口折叠文案</h2>
              {(['default', 'guided', 'direct'] as const).map((key) => (
                <div key={key} style={styles.block}>
                  <h3 style={styles.blockTitle}>{collapsedLabels[key]}</h3>
                  <label style={styles.fieldLabel}>
                    标题
                    <textarea
                      style={styles.textarea}
                      value={draft.miniprogram.guidedCard.collapsed[key].title}
                      onChange={(event) => updateCollapsed(key, 'title', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    描述
                    <textarea
                      style={styles.textarea}
                      value={draft.miniprogram.guidedCard.collapsed[key].description}
                      onChange={(event) => updateCollapsed(key, 'description', event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </article>

            <article style={styles.card}>
              <h2 style={styles.cardTitle}>步骤文案</h2>
              {(
                ['process_base', 'process_style', 'continent', 'country', 'variety', 'done'] as const
              ).map((key) => (
                <div key={key} style={styles.block}>
                  <h3 style={styles.blockTitle}>{stepLabels[key]}</h3>
                  <label style={styles.fieldLabel}>
                    标题
                    <textarea
                      style={styles.textarea}
                      value={draft.miniprogram.guidedCard.steps[key].title}
                      onChange={(event) => updateStep(key, 'title', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    描述
                    <textarea
                      style={styles.textarea}
                      value={draft.miniprogram.guidedCard.steps[key].description}
                      onChange={(event) => updateStep(key, 'description', event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </article>
          </section>

          <section style={styles.grid}>
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>问题选项卡</h2>
              {[
                ['processChoices', '基础处理法'],
                ['processStyleChoices', '处理风格'],
                ['continentChoices', '大洲方向'],
              ].map(([group, label]) => (
                <div key={group} style={styles.block}>
                  <h3 style={styles.blockTitle}>{label}</h3>
                  {draft.miniprogram.guidedCard[group as 'processChoices' | 'processStyleChoices' | 'continentChoices'].map(
                    (choice, index) => (
                      <div key={choice.id} style={styles.choiceCard}>
                        <p style={styles.choiceId}>{choice.id}</p>
                        <label style={styles.fieldLabel}>
                          标题
                          <input
                            style={styles.input}
                            value={choice.title}
                            onChange={(event) =>
                              updateChoice(group as 'processChoices' | 'processStyleChoices' | 'continentChoices', index, 'title', event.target.value)
                            }
                          />
                        </label>
                        <label style={styles.fieldLabel}>
                          描述
                          <textarea
                            style={styles.textarea}
                            value={choice.description}
                            onChange={(event) =>
                              updateChoice(group as 'processChoices' | 'processStyleChoices' | 'continentChoices', index, 'description', event.target.value)
                            }
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              ))}
            </article>

            <article style={styles.card}>
              <h2 style={styles.cardTitle}>按钮、提示和 Toast</h2>
              <div style={styles.block}>
                <label style={styles.fieldLabel}>
                  轻问答标签
                  <input
                    style={styles.input}
                    value={draft.miniprogram.guidedCard.label}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneConfig(current);
                        next.miniprogram.guidedCard.label = value;
                        return next;
                      });
                    }}
                  />
                </label>
                {Object.entries(draft.miniprogram.guidedCard.ui).map(([field, value]) => (
                  <label key={field} style={styles.fieldLabel}>
                    {field}
                    <textarea style={styles.textarea} value={value} onChange={(event) => updateUiText(field, event.target.value)} />
                  </label>
                ))}
              </div>
            </article>
          </section>

          <section style={styles.grid}>
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>小程序推荐区文案</h2>
              {([
                ['default', ['title', 'subtitle']],
                ['processBase', ['titleTemplate', 'subtitle']],
                ['continent', ['titleTemplate', 'subtitleTemplate']],
                ['country', ['titleTemplate', 'subtitle']],
                ['variety', ['titleTemplate', 'subtitle']],
              ] as const).map(([group, fields]) => (
                <div key={group} style={styles.block}>
                  <h3 style={styles.blockTitle}>{group}</h3>
                  {fields.map((field) => (
                    <label key={field} style={styles.fieldLabel}>
                      {field}
                      <textarea
                        style={styles.textarea}
                        value={(draft.miniprogram.discoverEditorial.templates[group] as Record<string, string>)[field]}
                        onChange={(event) => updateEditorialTemplate(group, field, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              ))}
              <div style={styles.block}>
                <h3 style={styles.blockTitle}>推荐理由模板</h3>
                {Object.entries(draft.miniprogram.discoverEditorial.reasons).map(([field, value]) => (
                  <label key={field} style={styles.fieldLabel}>
                    {field}
                    <textarea
                      style={styles.textarea}
                      value={value}
                      onChange={(event) => updateMiniprogramReason(field, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </article>

            <article style={styles.card}>
              <h2 style={styles.cardTitle}>API 编辑推荐文案</h2>
              {draft.api.editorialConfigs.map((config, index) => (
                <div key={`${config.id}-${index}`} style={styles.choiceCard}>
                  <label style={styles.fieldLabel}>
                    id
                    <input style={styles.input} value={config.id} onChange={(event) => updateApiConfig(index, 'id', event.target.value)} />
                  </label>
                  <label style={styles.fieldLabel}>
                    process 匹配
                    <input
                      style={styles.input}
                      value={config.match.process ?? ''}
                      onChange={(event) => updateApiMatch(index, 'process', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    continent 匹配
                    <input
                      style={styles.input}
                      value={config.match.continent ?? ''}
                      onChange={(event) => updateApiMatch(index, 'continent', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    country 匹配
                    <input
                      style={styles.input}
                      value={config.match.country ?? ''}
                      onChange={(event) => updateApiMatch(index, 'country', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    标题
                    <input
                      style={styles.input}
                      value={config.title}
                      onChange={(event) => updateApiConfig(index, 'title', event.target.value)}
                    />
                  </label>
                  <label style={styles.fieldLabel}>
                    副标题
                    <textarea
                      style={styles.textarea}
                      value={config.subtitle}
                      onChange={(event) => updateApiConfig(index, 'subtitle', event.target.value)}
                    />
                  </label>
                </div>
              ))}
              <div style={styles.block}>
                <h3 style={styles.blockTitle}>API 推荐理由模板</h3>
                {Object.entries(draft.api.editorialReasons).map(([field, value]) => (
                  <label key={field} style={styles.fieldLabel}>
                    {field}
                    <textarea style={styles.textarea} value={value} onChange={(event) => updateApiReason(field, event.target.value)} />
                  </label>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1320,
    margin: '0 auto',
    padding: '48px 24px 96px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
    gap: 24,
    padding: 28,
    border: '1px solid var(--line)',
    borderRadius: 28,
    background: 'linear-gradient(135deg, rgba(255, 250, 243, 0.96), rgba(245, 234, 220, 0.92))',
    boxShadow: 'var(--shadow)',
    marginBottom: 24,
  },
  eyebrow: {
    margin: 0,
    fontSize: 13,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  },
  title: {
    margin: '12px 0 10px',
    fontSize: 'clamp(32px, 5vw, 54px)',
    lineHeight: 1.04,
  },
  lead: {
    margin: 0,
    color: 'var(--muted)',
    fontSize: 16,
    lineHeight: 1.7,
  },
  toolbar: {
    display: 'grid',
    gap: 14,
    alignSelf: 'start',
    padding: 20,
    borderRadius: 22,
    background: 'var(--panel)',
    border: '1px solid var(--line)',
  },
  toolbarButtons: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    border: 0,
    borderRadius: 999,
    padding: '12px 18px',
    background: 'var(--accent)',
    color: '#fffaf4',
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid var(--line)',
    borderRadius: 999,
    padding: '12px 18px',
    background: 'var(--panel-strong)',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  message: {
    margin: 0,
    color: 'var(--muted)',
    lineHeight: 1.6,
  },
  emptyCard: {
    padding: 36,
    borderRadius: 28,
    border: '1px dashed var(--line)',
    background: 'rgba(255, 252, 247, 0.7)',
  },
  emptyText: {
    margin: 0,
    color: 'var(--muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
    marginTop: 20,
  },
  card: {
    padding: 22,
    borderRadius: 24,
    border: '1px solid var(--line)',
    background: 'var(--panel)',
    boxShadow: 'var(--shadow)',
  },
  cardTitle: {
    margin: '0 0 18px',
    fontSize: 24,
  },
  block: {
    display: 'grid',
    gap: 12,
    paddingTop: 14,
    marginTop: 14,
    borderTop: '1px solid var(--line)',
  },
  blockTitle: {
    margin: 0,
    fontSize: 17,
  },
  fieldLabel: {
    display: 'grid',
    gap: 8,
    fontSize: 14,
    color: 'var(--muted)',
  },
  input: {
    width: '100%',
    border: '1px solid var(--line)',
    borderRadius: 14,
    padding: '12px 14px',
    background: '#fffdf9',
    color: 'var(--text)',
  },
  textarea: {
    width: '100%',
    minHeight: 86,
    border: '1px solid var(--line)',
    borderRadius: 14,
    padding: '12px 14px',
    background: '#fffdf9',
    color: 'var(--text)',
    resize: 'vertical',
  },
  choiceCard: {
    display: 'grid',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    background: 'var(--panel-strong)',
    border: '1px solid var(--line)',
    marginTop: 10,
  },
  choiceId: {
    margin: 0,
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
};
