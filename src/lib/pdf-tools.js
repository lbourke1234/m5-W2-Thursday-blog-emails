import pdfPrinter from 'pdfmake'

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const dataURL = canvas.toDataURL('image/png')

      resolve(dataURL)
    }

    img.onerror = (error) => {
      reject(error)
    }

    img.src = url
  })
}

// async createPdf() {
// const docDefinition = {
//   content: [

//     {
//       image: await this.getBase64ImageFromURL(
//         "../../assets/ribbonLogo1.png"
//       )
//     }

export const getPDFReadableStream = (blogPost) => {
  const fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica'
    }
  }

  const printer = new pdfPrinter(fonts)
  const createPdf = async () => {
    const docDefinition = {
      content: [
        {
          text: blogPost.title,
          style: 'header'
        },
        {
          image: await getBase64ImageFromURL(
            'https://cdn.pixabay.com/photo/2015/03/14/19/45/suit-673697__340.jpg'
          )
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
        {
          text: blogPost.category,
          style: 'subheader'
        },
        blogPost.content,
        {
          text: 'Subheader 2 - using subheader style',
          style: 'subheader'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
        {
          text: blogPost.name,
          style: ['quote', 'small']
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 15,
          bold: true
        },
        small: {
          fontSize: 8
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      }
    }
    const getPDFReadableStream = printer.createPdfKitDocument(docDefinition, {})

    getPDFReadableStream.end()

    return getPDFReadableStream
  }
}
