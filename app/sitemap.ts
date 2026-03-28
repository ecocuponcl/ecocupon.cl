import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecocanasta.ecocupon.cl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    // If Supabase credentials are not available, return static sitemap
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not available for sitemap generation')
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            {
                url: `${baseUrl}/category/all`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/category/technology`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/category/fashion`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/category/home`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            },
            {
                url: `${baseUrl}/scan`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/profile`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/auth/login`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
        ]
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('slug, created_at')

    if (categoriesError) {
        console.error('Error fetching categories for sitemap:', categoriesError)
    }

    // Fetch products
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, created_at')
        .limit(1000)

    if (productsError) {
        console.error('Error fetching products for sitemap:', productsError)
    }

    const categoryUrls = (categories || []).map((category) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(category.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const productUrls = (products || []).map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/category`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/product`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...categoryUrls,
        ...productUrls,
    ]
}
