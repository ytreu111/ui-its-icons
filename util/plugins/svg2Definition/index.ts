import { createTrasformStream } from '../creator';
import { AbstractNode } from '../helpers';
import {
  pipe,
  clone,
  map,
  filter,
  where,
  equals,
  gt as greaterThan,
  both,
  unless,
  length,
  dissoc as deleteProp,
  reduce,
  path as get,
  __,
  applyTo,
  defaultTo,
} from 'ramda';
import parseXML, { Element } from '@rgrove/parse-xml';
import { renderAbstractNodeToSVGElement } from '../helpers';

export interface SVG2DefinitionOptions {
  extraNodeTransformFactories: TransformFactory[];
}

export interface XML2AbstractNodeOptions extends SVG2DefinitionOptions {
  name: string;
}

export type TransformOptions = Pick<XML2AbstractNodeOptions, 'name'>;

export interface TransformFactory {
  (options: TransformOptions): (asn: AbstractNode) => AbstractNode;
}

// SVG => IconDefinition
export const svg2Definition = ({
  extraNodeTransformFactories,
}: SVG2DefinitionOptions) =>
  createTrasformStream((SVGString, { stem: name }) =>
    applyTo(SVGString)(
      pipe(
        () => {
          return SVGString;
        },
        parseXML,
        pipe(
          get<Element>(['children', 0]),
          defaultTo(({} as any) as Element)
        ),
        element2AbstractNode({
          name,
          extraNodeTransformFactories
        }),
      (value) => renderAbstractNodeToSVGElement(value)
      )
    )
  );

function element2AbstractNode({
  name,
  extraNodeTransformFactories
}: XML2AbstractNodeOptions) {
  return ({ name: tag, attributes, children }: Element): AbstractNode =>
    applyTo(extraNodeTransformFactories)(
      pipe(
        map((factory: TransformFactory) => factory({ name })),
        reduce((transformedNode, extraTransformFn) => extraTransformFn(transformedNode),
          applyTo({
            tag,
            attrs: clone(attributes),
            children: applyTo(children as Element[])(
              pipe(
                filter<Element, 'array'>(where({ type: equals('element') })),
                map(element2AbstractNode({name, extraNodeTransformFactories})
                )
              )
            )
          })(
            unless<AbstractNode, AbstractNode>(
              where({
                children: both(Array.isArray, pipe(length, greaterThan(__, 0)))
              }),
              deleteProp('children')
            )
          )
        )
      )
    );
}
