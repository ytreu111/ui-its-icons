import { src, dest } from 'gulp';
import SVGO from 'svgo';
import rename from 'gulp-rename';
import { UseTemplatePluginOptions } from '../plugins/useTemplate';
import { useTemplate, svgo } from '../plugins';

export interface GenerateIconsOptions extends UseTemplatePluginOptions {
  from: string[];
  toDir: string;
  tmpDir: string;
  svgoConfig: SVGO.Options;
  filename: (option: { name: string }) => string;
}

export const generateIcons = (
  {
    from,
    toDir,
    svgoConfig,
    template,
    mapToInterpolate,
    filename,
    tmpDir,
  }: GenerateIconsOptions) =>
  function GenerateIcons() {
    return src(from)
      .pipe(svgo(svgoConfig))
      .pipe(
        rename((file) => {
          if (file.basename) {
            file.basename = file.basename.replace('Icon', '')
            file.basename = filename({ name: file.basename });
          }
        }),
      )
      .pipe(dest(tmpDir))
      .pipe(useTemplate({ template, mapToInterpolate }))
      .pipe(
        rename((file) => {
          if (file.basename) {
            file.extname = '.tsx';
          }
        }),
      )
      .pipe(dest(toDir));
  };
