import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PublishStatus } from '@/lib/types';

export interface AddBeanInput {
  roasterName: string;
  city?: string;
  countryCode?: string;
  beanName: string;
  originCountry?: string;
  farm?: string;
  processMethod?: string;
  variety?: string;
  displayName: string;
  roastLevel?: string;
  priceAmount?: number;
  priceCurrency?: string;
  isInStock?: boolean;
  status?: PublishStatus;
  productUrl?: string;
  flavorTags?: string[];
}

export interface AddBeanResponse {
  ok: boolean;
  roasterBeanId?: string;
  roasterId?: string;
  beanId?: string;
  error?: string;
}

function validateInput(input: AddBeanInput): string[] {
  const errors: string[] = [];

  if (!input.roasterName || input.roasterName.trim() === '') {
    errors.push('烘焙商名称不能为空');
  }

  if (!input.beanName || input.beanName.trim() === '') {
    errors.push('豆子名称不能为空');
  }

  if (!input.displayName || input.displayName.trim() === '') {
    errors.push('商品名不能为空');
  }

  if (input.priceAmount !== undefined && input.priceAmount !== null) {
    if (isNaN(input.priceAmount) || input.priceAmount < 0) {
      errors.push('价格必须是正数');
    }
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: AddBeanInput = {
      ...body,
      priceAmount: body.priceAmount ? Number(body.priceAmount) : undefined,
    };

    const validationErrors = validateInput(input);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { ok: false, error: validationErrors.join('; ') },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let roasterId: string | null = null;
    const { data: existingRoaster } = await supabase
      .from('roasters')
      .select('id')
      .ilike('name', input.roasterName.trim())
      .limit(1)
      .single();

    if (existingRoaster) {
      roasterId = existingRoaster.id;
    } else {
      const { data: newRoaster, error: roasterError } = await supabase
        .from('roasters')
        .insert({
          name: input.roasterName.trim(),
          city: input.city?.trim() || null,
          country_code: input.countryCode?.trim() || null,
          is_public: true,
        })
        .select('id')
        .single();

      if (roasterError) {
        return NextResponse.json(
          { ok: false, error: `创建烘焙商失败: ${roasterError.message}` },
          { status: 500 }
        );
      }
      roasterId = newRoaster.id;
    }

    let beanId: string | null = null;
    const { data: existingBean } = await supabase
      .from('beans')
      .select('id')
      .ilike('canonical_name', input.beanName.trim())
      .limit(1)
      .single();

    if (existingBean) {
      beanId = existingBean.id;
      // 如果提供了 farm 字段且现有 bean 没有 farm，则更新
      if (input.farm && input.farm.trim()) {
        await supabase
          .from('beans')
          .update({ farm: input.farm.trim() })
          .eq('id', beanId)
          .is('farm', null);
      }
    } else {
      const { data: newBean, error: beanError } = await supabase
        .from('beans')
        .insert({
          canonical_name: input.beanName.trim(),
          origin_country: input.originCountry?.trim() || null,
          farm: input.farm?.trim() || null,
          process_method: input.processMethod?.trim() || null,
          variety: input.variety?.trim() || null,
          flavor_tags: input.flavorTags || [],
          is_public: true,
        })
        .select('id')
        .single();

      if (beanError) {
        return NextResponse.json(
          { ok: false, error: `创建豆子失败: ${beanError.message}` },
          { status: 500 }
        );
      }
      beanId = newBean.id;
    }

    // 检查 roaster_beans 是否已存在
    const { data: existingRoasterBean } = await supabase
      .from('roaster_beans')
      .select('id')
      .eq('roaster_id', roasterId)
      .eq('bean_id', beanId)
      .eq('display_name', input.displayName.trim())
      .limit(1)
      .single();

    if (existingRoasterBean) {
      // 已存在则更新
      const { error: updateError } = await supabase
        .from('roaster_beans')
        .update({
          roast_level: input.roastLevel?.trim() || null,
          price_amount: input.priceAmount || null,
          price_currency: input.priceCurrency?.trim() || 'CNY',
          product_url: input.productUrl?.trim() || null,
          is_in_stock: input.isInStock ?? true,
          status: input.status || 'DRAFT',
        })
        .eq('id', existingRoasterBean.id);

      if (updateError) {
        return NextResponse.json(
          { ok: false, error: `更新商品失败: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        roasterBeanId: existingRoasterBean.id,
        roasterId,
        beanId,
        updated: true,
      });
    }

    const { data: roasterBean, error: roasterBeanError } = await supabase
      .from('roaster_beans')
      .insert({
        roaster_id: roasterId,
        bean_id: beanId,
        display_name: input.displayName.trim(),
        roast_level: input.roastLevel?.trim() || null,
        price_amount: input.priceAmount || null,
        price_currency: input.priceCurrency?.trim() || 'CNY',
        product_url: input.productUrl?.trim() || null,
        is_in_stock: input.isInStock ?? true,
        status: input.status || 'DRAFT',
      })
      .select('id')
      .single();

    if (roasterBeanError) {
      return NextResponse.json(
        { ok: false, error: `创建商品失败: ${roasterBeanError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      roasterBeanId: roasterBean.id,
      roasterId,
      beanId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
