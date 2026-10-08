function attributeName(attribute) {
  if (!attribute.directive) return attribute.key.name
  return attribute.key.name.name === 'bind' ? attribute.key.argument?.name : null
}

function templateRule(check) {
  return {
    meta: { type: 'problem', schema: [], messages: { missing: 'Define {{requirement}} for this control.' } },
    create(context) {
      return context.sourceCode.parserServices.defineTemplateBodyVisitor?.({
        VElement(node) {
          const attributes = new Map(node.startTag.attributes.map(attribute => [attributeName(attribute), attribute]))
          const requirement = check(node, attributes)
          if (requirement) context.report({ node: node.startTag, messageId: 'missing', data: { requirement } })
        },
      }) || {}
    },
  }
}

export default {
  rules: {
    'icon-semantics': templateRule((node, attributes) => {
      if (node.name !== 'i') return
      const hidden = attributes.get('aria-hidden')
      const decorative = hidden && (hidden.directive || hidden.value?.value === 'true')
      if (!decorative && !attributes.has('aria-label') && !attributes.has('aria-labelledby')) {
        return 'aria-hidden="true" for a decorative icon or an accessible label for a meaningful icon'
      }
    }),
    'radio-name': templateRule((node, attributes) => {
      if (node.name === 'input' && attributes.get('type')?.value?.value === 'radio' && !attributes.has('name')) {
        return 'a shared name within each radio group'
      }
    }),
  },
}
