import { useKeenSlider } from "keen-slider/react"


import { HomeContainer, Product } from "../styles/pages/home"
import Image from "next/image"

import "keen-slider/keen-slider.min.css"
import { GetStaticProps } from "next"
import { stripe } from "../lib/stripe"
import Stripe from "stripe"
import Link from "next/link"

interface HomePorps {
    products: {
        id: string
        name: string
        imageUrl: string
        price: string
    }[]
}

export default function Home({ products }: HomePorps) {
    const [sliderRef] = useKeenSlider({
        slides: {
            perView: 3,
            spacing: 48
        }
    });


    return (
        <HomeContainer ref={sliderRef} className="keen-slider">
            {
                products.map(product => {
                    return (
                        <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
                            <Product className="keen-slider__slide">
                                <Image src={product.imageUrl} width={520} height={480} alt=""/>
                                <footer>
                                    <strong>{product.name}</strong>
                                    <span>R$ {product.price}</span>
                                </footer>
                            </Product>
                        </Link>
                    )
                })
            }
        </HomeContainer>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const response = await stripe.products.list({
        expand: ['data.default_price']
    });
    const products = response.data.map(product => {
        const price = product.default_price as Stripe.Price;
        return {
            id: product.id,
            name: product.name,
            imageUrl: product.images[0],
            price: new Intl.NumberFormat('pt-BR',{
                style: 'currency',
                currency: 'BRL'
            }).format(price.unit_amount / 100),
        }
    })

    return {
        props: {
            products
        },
        revalidate: 60*60*2// 2hours
    }
}